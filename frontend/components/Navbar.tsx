'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(window.localStorage.getItem('uni_lend_token')));
  }, []);

  function handleLogout() {
    window.localStorage.removeItem('uni_lend_token');
    window.localStorage.removeItem('uni_lend_user');
    document.cookie = 'uni_lend_token=; Max-Age=0; path=/';
    window.location.href = '/';
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-brand-600">
          uni-lend
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="text-slate-600 hover:text-brand-600">
                Hồ sơ
              </Link>
              <button onClick={handleLogout} className="text-slate-600 hover:text-brand-600">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-brand-600">
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-white hover:bg-brand-600"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
