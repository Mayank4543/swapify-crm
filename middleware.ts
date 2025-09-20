import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    console.log('Middleware called for:', pathname);

    // Only apply middleware to admin routes
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('auth-token')?.value;
        console.log('Admin route accessed, token exists:', !!token);

        // If no token, redirect to login
        if (!token) {
            console.log('No token found, redirecting to login');
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Token exists, let it through (verification will be done by API routes and auth context)
        console.log('Auth token found, allowing access to admin');
        return NextResponse.next();
    }

    return NextResponse.next();
} export const config = {
    matcher: ['/admin/:path*']
};