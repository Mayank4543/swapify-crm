import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

// Force this API route to use Node.js runtime
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret';

// Middleware to verify authentication
async function verifyAuth(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
            request.cookies.get('auth-token')?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
        return decoded;
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

// GET - Get single user details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const userId = params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Get the user (excluding sensitive fields)
        const foundUser = await User.findById(userId)
            .select('-password -reset_token -reset_token_expires -verification_token -verification_token_expires')
            .lean();

        if (!foundUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: foundUser
        });

    } catch (error) {
        console.error('Get user details error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}