import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {

            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
} export const config = {
    matcher: ['/admin/:path*']
};