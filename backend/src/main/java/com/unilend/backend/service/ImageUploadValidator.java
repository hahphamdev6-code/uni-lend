package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import com.unilend.backend.common.exception.ErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.MemoryCacheImageInputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Iterator;
import java.util.Locale;

/** Decode and re-encode images; never store client metadata or appended payloads. */
@Component
public class ImageUploadValidator {
    static final int MAX_FILE_BYTES = 5 * 1024 * 1024;
    private static final int MAX_DIMENSION = 8192;
    private static final long MAX_PIXELS = 16_000_000L;
    private static final byte[] PNG_SIGNATURE = {(byte) 137, 80, 78, 71, 13, 10, 26, 10};

    public record ValidatedImage(byte[] bytes, String extension) { }

    public ValidatedImage validate(MultipartFile file) {
        if (file == null || file.isEmpty()) throw invalid("File ảnh không được rỗng");
        if (file.getSize() > MAX_FILE_BYTES) throw invalid("Kích thước mỗi ảnh không được vượt quá 5MB");
        try (InputStream input = file.getInputStream()) {
            byte[] bytes = input.readNBytes(MAX_FILE_BYTES + 1);
            if (bytes.length > MAX_FILE_BYTES) throw invalid("Kích thước mỗi ảnh không được vượt quá 5MB");
            String expected = signatureFormat(bytes);
            try (var imageInput = new MemoryCacheImageInputStream(new ByteArrayInputStream(bytes))) {
                Iterator<ImageReader> readers = ImageIO.getImageReaders(imageInput);
                if (!readers.hasNext()) throw invalid("Không thể giải mã nội dung ảnh");
                ImageReader reader = readers.next();
                try {
                    if (!reader.getFormatName().toLowerCase(Locale.ROOT).equals(expected)) {
                        throw invalid("Chữ ký ảnh không khớp nội dung");
                    }
                    reader.setInput(imageInput, true, true);
                    reader.addIIOReadWarningListener((source, warning) -> {
                        throw invalid("Ảnh bị lỗi hoặc thiếu dữ liệu");
                    });
                    int width = reader.getWidth(0), height = reader.getHeight(0);
                    if (width <= 0 || height <= 0 || width > MAX_DIMENSION || height > MAX_DIMENSION
                            || (long) width * height > MAX_PIXELS) {
                        throw invalid("Ảnh tối đa 16 triệu điểm ảnh và 8192 pixel mỗi chiều");
                    }
                    BufferedImage decoded = reader.read(0);
                    if (decoded == null) throw invalid("Nội dung ảnh không hợp lệ");
                    // Normalize WebP to static PNG; remove metadata and trailing payloads.
                    String format = expected.equals("jpeg") ? "jpeg" : "png";
                    try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                        if (!ImageIO.write(decoded, format, output)) throw invalid("Không thể chuẩn hoá ảnh");
                        if (output.size() > MAX_FILE_BYTES) {
                            throw invalid("Ảnh sau chuẩn hoá vượt quá 5MB, vui lòng giảm kích thước ảnh");
                        }
                        return new ValidatedImage(output.toByteArray(), format.equals("jpeg") ? ".jpg" : ".png");
                    } finally {
                        decoded.flush();
                    }
                } finally {
                    reader.dispose();
                }
            }
        } catch (BusinessException ex) {
            throw ex;
        } catch (IOException | RuntimeException ex) {
            throw invalid("File không phải ảnh JPG, PNG, WEBP hợp lệ hoặc đã bị hỏng");
        }
    }

    private String signatureFormat(byte[] bytes) {
        if (bytes.length >= 8 && Arrays.equals(Arrays.copyOf(bytes, 8), PNG_SIGNATURE)) return "png";
        if (bytes.length >= 3 && (bytes[0] & 255) == 255 && (bytes[1] & 255) == 216
                && (bytes[2] & 255) == 255) return "jpeg";
        if (bytes.length >= 12 && new String(bytes, 0, 4, StandardCharsets.US_ASCII).equals("RIFF")
                && new String(bytes, 8, 4, StandardCharsets.US_ASCII).equals("WEBP")) return "webp";
        throw invalid("Chỉ chấp nhận nội dung ảnh JPG, PNG hoặc WEBP");
    }

    private BusinessException invalid(String message) {
        return new BusinessException(ErrorCode.BAD_REQUEST, message);
    }
}
