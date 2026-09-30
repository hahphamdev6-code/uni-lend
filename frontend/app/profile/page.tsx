"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Modal } from "@/components/Modal";

export default function ProfilePage() {
  // Dữ liệu giả lập thông tin người dùng
  const [user] = useState({
    username: "sinhvien_haui",
    fullName: "Trần Nhật Sang",
    email: "sangtn@haui.edu.vn",
    role: "USER",
    studentId: "2024601234",
    joinedDate: "30/09/2026",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
          <p className="text-sm text-zinc-500">Quản lý thông tin tài khoản của bạn trên uni-lend</p>
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm">Đăng xuất</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái: Avatar & Vai trò */}
        <Card className="flex flex-col items-center text-center p-6">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white text-3xl font-bold flex items-center justify-center mb-4 shadow">
            {user.fullName.charAt(0)}
          </div>
          <h2 className="text-lg font-semibold">{user.fullName}</h2>
          <span className="text-xs px-2.5 py-0.5 mt-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            {user.role}
          </span>
          <p className="text-xs text-zinc-400 mt-4">Thành viên từ: {user.joinedDate}</p>
        </Card>

        {/* Cột phải: Chi tiết thông tin */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Chi tiết tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Tên người dùng</p>
                <p className="font-medium mt-0.5">{user.username}</p>
              </div>
              <div>
                <p className="text-zinc-500">Mã sinh viên</p>
                <p className="font-medium mt-0.5">{user.studentId}</p>
              </div>
              <div>
                <p className="text-zinc-500">Email liên lạc</p>
                <p className="font-medium mt-0.5">{user.email}</p>
              </div>
              <div>
                <p className="text-zinc-500">Trạng thái mượn đồ</p>
                <p className="font-medium mt-0.5 text-green-600">Bình thường (Không nợ đồ)</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
              <Button onClick={() => setIsModalOpen(true)}>Chỉnh sửa thông tin</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal chỉnh sửa thử nghiệm */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Chỉnh sửa thông tin cá nhân">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Chức năng chỉnh sửa thông tin sẽ được kết nối trực tiếp với backend trong giai đoạn tiếp theo.
        </p>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setIsModalOpen(false)}>Đóng</Button>
        </div>
      </Modal>
    </div>
  );
}