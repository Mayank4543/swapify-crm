import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';


export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(request: NextRequest) {
    try {
       
        await dbConnect();
        

        const { username, password } = await request.json();
       

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

       
        const admin = await Admin.findOne({ username });
       

        if (!admin) {
            return NextResponse.json(
                { error: 'Invalid credentials - user not found' },
                { status: 401 }
            );
        }

        // Verify password
      
        const isValidPassword = await bcrypt.compare(password, admin.password);
       

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

      
        await Admin.findByIdAndUpdate(admin._id, { last_login: new Date() });

    
        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: admin._id,
                username: admin.username,
                role: admin.role,
                email: admin.email,
                profile_image: admin.profile_image,
                region: admin.region
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