import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';

// Force this API route to use Node.js runtime
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Middleware to verify manager role
async function verifyManager(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.role !== 'manager') {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
}

// GET - List all admins (Manager only)
export async function GET(request: NextRequest) {
    try {
        const user = await verifyManager(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Forbidden - Manager access required' },
                { status: 403 }
            );
        }

        await dbConnect();
        const admins = await Admin.find({ role: 'admin' }, { password: 0 });

        return NextResponse.json({ admins });

    } catch (error) {
        console.error('Get admins error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new admin (Manager only)
export async function POST(request: NextRequest) {
    try {
        const user = await verifyManager(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Forbidden - Manager access required' },
                { status: 403 }
            );
        }

        await dbConnect();
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.create({
            username,
            password: hashedPassword,
            role: 'admin'
        });

        return NextResponse.json({
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Create admin error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete admin (Manager only)
export async function DELETE(request: NextRequest) {
    try {
        const user = await verifyManager(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Forbidden - Manager access required' },
                { status: 403 }
            );
        }

        await dbConnect();
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        const result = await Admin.deleteOne({ username, role: 'admin' });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Admin not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Admin deleted successfully'
        });

    } catch (error) {
        console.error('Delete admin error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}