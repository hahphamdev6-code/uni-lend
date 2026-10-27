import type { Metadata } from "next";
import { AuthProvider } from "./auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNILEND.™ — Campus & Community Free Item Borrowing & Lending",
  description:
    "Discover quality items from your campus and community for every occasion. Borrow what you need, when you need it, without the cost of owning everything.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="scroll-smooth" lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
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
