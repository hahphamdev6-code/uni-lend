"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên tài khoản hoặc email";
    }
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải từ 6 ký tự trở lên";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    // Giả lập gửi form (Mock Data)
    setTimeout(() => {
      setLoading(false);
      // Giả lập tài khoản demo kiểm tra lỗi
      if (formData.username === "error") {
        setErrors({ general: "Tài khoản hoặc mật khẩu không chính xác!" });
      } else {
        alert("Đăng nhập thành công (Dữ liệu giả)!");
        router.push("/profile");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <p className="text-sm text-zinc-500 mt-1">Hệ thống mượn đồ dùng uni-lend</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                {errors.general}
              </div>
            )}
            <Input
              label="Tên người dùng / Email"
              placeholder="Nhập username hoặc email..."
              value={formData.username}
              error={errors.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu..."
              value={formData.password}
              error={errors.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Button type="submit" isLoading={loading} className="w-full mt-2">
              Đăng nhập
            </Button>
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}