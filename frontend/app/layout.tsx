import type { Metadata } from "next";
import "./globals.css";

import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "uni-lend",
  description: "Nền tảng cho mượn đồ dùng trong trường học",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
