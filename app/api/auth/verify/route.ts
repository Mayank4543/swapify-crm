import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Force this API route to use Node.js runtime
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        return NextResponse.json({
            user: {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role,
                email: decoded.email,
                profile_image: decoded.profile_image
            }
        });

    } catch (error) {
        console.error('Verify token error:', error);
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
        );
    }
}