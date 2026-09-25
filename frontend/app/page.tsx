import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="flex flex-col items-center gap-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-slate-900">uni-lend</h1>
      <p className="max-w-xl text-slate-600">
        Nền tảng giúp sinh viên cho mượn và mượn đồ dùng học tập, sinh hoạt trong trường một cách
        dễ dàng và an toàn.
      </p>
      <div className="flex gap-3">
        <Link
          href="/register"
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Bắt đầu ngay
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Đăng nhập
        </Link>
      </div>
    </section>
  );
}
