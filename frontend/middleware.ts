import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Lấy token từ cookie (Next.js middleware chạy ở server-side nên đọc được cookie)
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl;

  // Danh sách các trang yêu cầu phải đăng nhập mới được truy cập
  const protectedRoutes = ['/profile', '/dashboard'];
  
  // Danh sách các trang xác thực (nếu đã đăng nhập thì không cho vào lại trang login/register)
  const authRoutes = ['/login', '/register'];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Nếu truy cập trang cần bảo vệ mà không có token -> Chuyển hướng về trang đăng nhập
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Nếu đã đăng nhập mà lại vào trang login/register -> Chuyển hướng về trang chủ
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Cấu hình các đường dẫn mà middleware sẽ chạy qua kiểm tra
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};