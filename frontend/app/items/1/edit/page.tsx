"use client";

import React, { use } from "react";
import Link from "next/link";
import { ItemForm, ItemFormData } from "@/components/ItemForm";

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  // Unจะparams id trong Next.js App Router
  const resolvedParams = use(params);
  const itemId = resolvedParams.id;

  // Dữ liệu mẫu ban đầu để hiển thị khi sửa
  const mockInitialData: ItemFormData = {
    title: "Máy tính Casio fx-580VNX",
    categoryId: "2",
    description: "Máy tính còn dùng tốt, màn hình sáng rõ, phù hợp thi cử.",
    condition: "Mới 95%",
    depositFee: 100000,
    imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400",
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa món đồ</h1>
          <p className="text-sm text-zinc-500">Mã món đồ: #{itemId}</p>
        </div>
        <Link
          href="/items/me"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          &larr; Quay lại Đồ của tôi
        </Link>
      </div>

      <ItemForm initialData={mockInitialData} isEditMode={true} itemId={itemId} />
    </div>
  );
}