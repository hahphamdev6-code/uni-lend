import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniLend | Dùng chung, vui hơn mỗi ngày",
  description:
    "Tìm và chia sẻ những món đồ hữu ích cùng cộng đồng sinh viên quanh bạn.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
