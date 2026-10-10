"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { Input } from "./Input";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { useToast } from "./Toast";

export interface ItemFormData {
  title: string;
  categoryId: string;
  description: string;
  condition: string;
  depositFee?: number;
  imageUrl?: string;
}

interface ItemFormProps {
  initialData?: ItemFormData;
  isEditMode?: boolean;
  itemId?: string;
}

// Danh mục mẫu (khớp với BE Category)
const CATEGORIES = [
  { id: "1", name: "Sách & Giáo trình" },
  { id: "2", name: "Thiết bị điện tử (Máy tính, Sạc, Chuột)" },
  { id: "3", name: "Dụng cụ học tập" },
  { id: "4", name: "Đồ dùng cá nhân & Thể thao" },
  { id: "5", name: "Khác" },
];

export const ItemForm: React.FC<ItemFormProps> = ({
  initialData,
  isEditMode = false,
  itemId,
}) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ItemFormData>(
    initialData || {
      title: "",
      categoryId: "",
      description: "",
      condition: "Mới 90%",
      depositFee: 0,
      imageUrl: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tên món đồ";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả chi tiết";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
    }
    if (!formData.condition.trim()) {
      newErrors.condition = "Vui lòng nhập tình trạng món đồ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // Giả lập gọi API (sau này thay bằng apiClient.post/put khi có backend thật)
    setTimeout(() => {
      setLoading(false);
      if (isEditMode) {
        showToast("Cập nhật thông tin món đồ thành công!", "success");
      } else {
        showToast("Đăng món đồ mới thành công!", "success");
      }
      router.push("/items/me"); // Chuyển về trang "Đồ của tôi"
    }, 1000);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? "Chỉnh sửa món đồ" : "Đăng món đồ mới"}</CardTitle>
        <p className="text-sm text-zinc-500 mt-1">
          {isEditMode
            ? "Cập nhật các thông tin chi tiết về món đồ của bạn"
            : "Điền thông tin đồ dùng bạn muốn chia sẻ/cho mượn trong trường"}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Tên món đồ *"
            placeholder="Ví dụ: Máy tính Casio fx-580VNX, Giáo trình C++..."
            value={formData.title}
            error={errors.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Danh mục *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors ${
                errors.categoryId
                  ? "border-red-500"
                  : "border-zinc-300 dark:border-zinc-700 focus:border-blue-500"
              }`}
            >
              <option value="">-- Chọn danh mục phù hợp --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="text-xs text-red-500 font-medium">
                {errors.categoryId}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Mô tả chi tiết *
            </label>
            <textarea
              rows={4}
              placeholder="Mô tả kỹ về chức năng, phụ kiện đi kèm, lưu ý khi mượn..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors ${
                errors.description
                  ? "border-red-500"
                  : "border-zinc-300 dark:border-zinc-700 focus:border-blue-500"
              }`}
            />
            {errors.description && (
              <span className="text-xs text-red-500 font-medium">
                {errors.description}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tình trạng đồ *"
              placeholder="Ví dụ: Mới 95%, Đã qua sử dụng tốt"
              value={formData.condition}
              error={errors.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            />
            <Input
              label="Tiền cọc (VNĐ - nếu có)"
              type="number"
              min="0"
              placeholder="0"
              value={formData.depositFee || ""}
              onChange={(e) =>
                setFormData({ ...formData, depositFee: Number(e.target.value) })
              }
            />
          </div>

          <Input
            label="Đường dẫn ảnh (URL)"
            placeholder="https://example.com/item.jpg"
            value={formData.imageUrl || ""}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            helperText="Dán link ảnh đại diện cho món đồ để người mượn dễ hình dung"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" isLoading={loading}>
              {isEditMode ? "Lưu thay đổi" : "Đăng món đồ"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};