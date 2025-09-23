import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Get token from cookies
        const token = request.cookies.get('auth-token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        if (!decoded.id) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Get region from request body
        const { region } = await request.json();

        if (!region) {
            return NextResponse.json(
                { error: 'Region is required' },
                { status: 400 }
            );
        }

        // Update user's region (only for admins)
        const admin = await Admin.findById(decoded.id);
        
        if (!admin) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (admin.role === 'admin') {
            await Admin.findByIdAndUpdate(decoded.id, { region });
        }

        return NextResponse.json({
            message: 'Region updated successfully',
            region
        });

    } catch (error) {
        console.error('Update region error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
