import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyTokenAndGetUser, getRegionFilter } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
    try {
        const user = await verifyTokenAndGetUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        // Build base query with region filter
        const regionFilter = getRegionFilter(user, 'user');

        // If ID is provided, fetch single user
        if (userId) {
            const query = { _id: userId, ...regionFilter };
            const foundUser = await User.findOne(query, { user_password: 0 });

            if (!foundUser) {
                return NextResponse.json(
                    { error: 'User not found or access denied' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ user: foundUser });
        }

        // Otherwise, fetch all users with region filter
        const users = await User.find(regionFilter, { user_password: 0 }).sort({ created_at: -1 });

        return NextResponse.json({
            users,
            regionFilter: 'All Users' // Users are not filtered by region
        });

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
        const user = await verifyTokenAndGetUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id, username, email, status, segment, phone_number, country, state, city, pincode, address, last_visit } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Build query with region filter
        const regionFilter = getRegionFilter(user, 'user');
        const query = { _id: id, ...regionFilter };

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

        const updatedUser = await User.findOneAndUpdate(
            query,
            updateData,
            { new: true, select: '-user_password' }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found or access denied' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'User updated successfully',
            user: updatedUser
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
        const user = await verifyTokenAndGetUser(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check if user is manager (only managers can delete users)
        if (user.role !== 'manager') {
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

        // Managers can delete users from any region, so no region filter needed
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
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