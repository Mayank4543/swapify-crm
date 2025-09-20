import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Force this API route to use Node.js runtime
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        // If ID is provided, fetch single user
        if (userId) {
            const user = await User.findById(userId, { user_password: 0 });

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ user });
        }

        // Otherwise, fetch all users
        const users = await User.find({}, { user_password: 0 }).sort({ created_at: -1 });

        return NextResponse.json({ users });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { username, email, status, segment } = await request.json();

        if (!username || !email) {
            return NextResponse.json(
                { error: 'Username and email are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this username or email already exists' },
                { status: 400 }
            );
        }

        const user = await User.create({
            username,
            email,
            user_password: 'temp_password', // You might want to generate a random password
            status: status || 'pending',
            segment: segment || 'Standard',
            join_date: new Date(),
            created_at: new Date()
        });

        // Return user without password
        const userResponse = await User.findById(user._id, { user_password: 0 });

        return NextResponse.json({
            message: 'User created successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();

        const { id, username, email, status, segment, phone_number, country, state, city, pincode, address, last_visit } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (status) updateData.status = status;
        if (segment) updateData.segment = segment;
        if (phone_number !== undefined) updateData.phone_number = phone_number;
        if (country !== undefined) updateData.country = country;
        if (state !== undefined) updateData.state = state;
        if (city !== undefined) updateData.city = city;
        if (pincode !== undefined) updateData.pincode = pincode;
        if (address !== undefined) updateData.address = address;
        if (last_visit) updateData.last_visit = new Date(last_visit);

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, select: '-user_password' }
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();

        // Verify token and check role
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Check if user is manager (only managers can delete users)
        if (decoded.role !== 'manager') {
            return NextResponse.json(
                { error: 'Insufficient permissions. Only managers can delete users.' },
                { status: 403 }
            );
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}