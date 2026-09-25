import { NextRequest, NextResponse } from 'next/server';

// Routes that require the visitor to be logged in.
const PROTECTED_PATHS = ['/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  // The JWT itself lives in localStorage (client-side), so we also mirror it into a
  // cookie on login/logout (see components use) so middleware can read it here.
  const token = request.cookies.get('uni_lend_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*'],
};
