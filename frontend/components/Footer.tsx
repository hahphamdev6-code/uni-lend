export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-lg font-bold text-blue-600">Uni-Lend</span>
          <p className="text-sm text-gray-500 mt-1">
            Nền tảng chia sẻ và mượn đồ dùng thông minh trong cộng đồng sinh viên.
          </p>
        </div>
        <div className="text-sm text-gray-500 text-center md:text-right">
          <p>&copy; {new Date().getFullYear()} Uni-Lend Platform. Phát triển vì cộng đồng sinh viên.</p>
        </div>
      </div>
    </footer>
  );
}