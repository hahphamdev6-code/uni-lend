import type { Metadata } from "next";
import { AuthProvider } from "./auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNILEND.™ — Nền Tảng Cho Thuê & Chia Sẻ Thiết Bị Sinh Viên",
  description:
    "Khám phá và thuê các thiết bị công nghệ, máy ảnh, dụng cụ học tập chất lượng cao từ cộng đồng sinh viên đã xác thực. Tiết kiệm chi phí, bảo vệ bởi SafeGuarantee™.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="scroll-smooth" lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap&subset=vietnamese"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-[#0D0E12] antialiased selection:bg-rose-100 selection:text-black flex flex-col min-h-screen overflow-x-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
