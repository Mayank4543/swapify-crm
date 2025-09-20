import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';

// Force this API route to use Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Check if manager already exists
        const existingManager = await Admin.findOne({ role: 'manager' });
        if (existingManager) {
            return NextResponse.json({
                message: 'Manager already exists',
                username: existingManager.username
            });
        }

        // Create default manager account
        const username = 'manager';
        const password = 'admin123'; // Change this in production!
        const hashedPassword = await bcrypt.hash(password, 10);

        const manager = await Admin.create({
            username,
            password: hashedPassword,
            role: 'manager'
        });

        return NextResponse.json({
            message: 'Manager account created successfully!',
            username: manager.username,
            warning: 'IMPORTANT: Change the default password after first login!'
        });

    } catch (error) {
        console.error('Error creating manager:', error);
        return NextResponse.json(
            { error: 'Failed to create manager account' },
            { status: 500 }
        );
    }
}