import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';

// Force this API route to use Node.js runtime
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(request: NextRequest) {
    try {
        console.log('Attempting database connection...');
        await dbConnect();
        console.log('Database connected successfully');

        const { username, password } = await request.json();
        console.log('Login attempt for username:', username);

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find admin by username
        console.log('Searching for admin with username:', username);
        const admin = await Admin.findOne({ username });
        console.log('Admin found:', admin ? 'Yes' : 'No');

        if (!admin) {
            return NextResponse.json(
                { error: 'Invalid credentials - user not found' },
                { status: 401 }
            );
        }

        // Verify password
        console.log('Verifying password...');
        const isValidPassword = await bcrypt.compare(password, admin.password);
        console.log('Password valid:', isValidPassword);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials - wrong password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: admin._id,
                username: admin.username,
                role: admin.role,
                email: admin.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login
        await Admin.findByIdAndUpdate(admin._id, { last_login: new Date() });

        // Create response with token in httpOnly cookie
        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: admin._id,
                username: admin.username,
                role: admin.role,
                email: admin.email,
                profile_image: admin.profile_image
            }
        });

        // Set httpOnly cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}