"use client";

import React from "react";
import Link from "next/link";
import { ItemForm } from "@/components/ItemForm";

export default function CreateItemPage() {
  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đăng món đồ mới</h1>
          <p className="text-sm text-zinc-500">
            Chia sẻ đồ dùng học tập của bạn cho các bạn sinh viên khác
          </p>
        </div>
        <Link
          href="/items/me"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          &larr; Quay lại Đồ của tôi
        </Link>
      </div>

      <ItemForm isEditMode={false} />
    </div>
  );
}