import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Redirect non-www to www for cruisesfromgalveston.net
  // This handles cases where vercel.json redirects might not catch everything
  if (hostname === 'cruisesfromgalveston.net') {
    url.host = 'www.cruisesfromgalveston.net';
    url.protocol = 'https:';
    // Preserve pathname and search params
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

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
