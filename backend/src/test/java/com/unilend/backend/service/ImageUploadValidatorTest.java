package com.unilend.backend.service;

import com.unilend.backend.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockMultipartFile;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.*;

class ImageUploadValidatorTest {
    private final ImageUploadValidator validator = new ImageUploadValidator();

    @ParameterizedTest
    @ValueSource(strings = {"valid.png", "valid.jpg", "valid.webp"})
    void acceptsRealImageDespiteFalseClientMetadata(String fixture) throws Exception {
        var result = validator.validate(new MockMultipartFile("files", "../../payload.exe",
                "application/octet-stream", fixture(fixture)));
        assertEquals(fixture.endsWith("jpg") ? ".jpg" : ".png", result.extension());
        var decoded = ImageIO.read(new ByteArrayInputStream(result.bytes()));
        assertNotNull(decoded);
        assertEquals(2, decoded.getWidth());
    }

    @Test
    void rejectsTextRenamedAsJpeg() {
        assertThrows(BusinessException.class, () -> validator.validate(
                new MockMultipartFile("files", "fake.jpg", "image/jpeg", "<script>alert(1)</script>".getBytes())));
    }

    @Test
    void rejectsForgedSignatureWithoutDecodablePixels() throws Exception {
        for (String name : new String[]{"valid.png", "valid.jpg", "valid.webp"}) {
            byte[] prefix = Arrays.copyOf(fixture(name), 12);
            assertThrows(BusinessException.class, () -> validator.validate(
                    new MockMultipartFile("files", name, "image/png", prefix)));
        }
    }

    @Test
    void rejectsUnsupportedGif() throws Exception {
        assertThrows(BusinessException.class, () -> validator.validate(
                new MockMultipartFile("files", "fake.png", "image/png", fixture("unsupported.gif"))));
    }

    @Test
    void rejectsNullEmptyAndOversizedFiles() {
        assertThrows(BusinessException.class, () -> validator.validate(null));
        assertThrows(BusinessException.class, () -> validator.validate(new MockMultipartFile("files", new byte[0])));
        assertThrows(BusinessException.class, () -> validator.validate(
                new MockMultipartFile("files", new byte[ImageUploadValidator.MAX_FILE_BYTES + 1])));
    }

    @Test
    void checksActualStreamLengthEvenWhenReportedSizeIsFalse() {
        var dishonest = new MockMultipartFile("files", new byte[ImageUploadValidator.MAX_FILE_BYTES + 1]) {
            @Override public long getSize() { return 1; }
        };
        assertThrows(BusinessException.class, () -> validator.validate(dishonest));
    }

    @Test
    void removesAppendedPayload() throws Exception {
        byte[] original = fixture("valid.png");
        byte[] payload = "UNILEND_APPENDED_SCRIPT_123".getBytes(StandardCharsets.US_ASCII);
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        stream.write(original);
        stream.write(payload);
        var result = validator.validate(new MockMultipartFile("files", stream.toByteArray()));
        assertFalse(new String(result.bytes(), StandardCharsets.ISO_8859_1).contains("UNILEND_APPENDED_SCRIPT_123"));
        assertNotNull(ImageIO.read(new ByteArrayInputStream(result.bytes())));
    }

    @Test
    void rejectsExcessiveDimensions() throws Exception {
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(8193, 1, BufferedImage.TYPE_INT_RGB), "png", output);
        assertThrows(BusinessException.class, () -> validator.validate(new MockMultipartFile("files", output.toByteArray())));
    }

    private byte[] fixture(String name) throws Exception {
        try (var in = getClass().getResourceAsStream("/upload/" + name)) {
            assertNotNull(in);
            return in.readAllBytes();
        }
    }
}
