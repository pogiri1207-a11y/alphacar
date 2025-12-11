import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/quote/compare', '/quote/personal'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 보호된 경로에 접근 시
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get('accessToken')?.value;

    // 토큰 없으면 로그인 페이지로 강제 이동
    if (!token) {
      const loginUrl = new URL('/mypage/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname); // 돌아올 주소 기억
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/quote/:path*'],
};
