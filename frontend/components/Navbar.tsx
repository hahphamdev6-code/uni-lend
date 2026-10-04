'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Slogan brief */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2">
              <span>Uni-Lend</span>
              <span className="text-xs font-normal px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-200 hidden sm:inline-block">
                Sinh viên
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/market"
              className={`text-sm font-medium transition-colors ${
                pathname === '/market' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Khám phá đồ
            </Link>
            <Link
              href="/rules"
              className={`text-sm font-medium transition-colors ${
                pathname === '/rules' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Quy chế mượn đồ
            </Link>
          </nav>

          {/* Action Buttons: Đăng đồ + Auth */}
          <div className="flex items-center space-x-3">
            <Link
              href="/items/create"
              className="hidden sm:inline-flex items-center px-3.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + Đăng cho mượn
            </Link>
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}