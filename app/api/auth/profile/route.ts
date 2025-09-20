import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function verifyToken(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
            username: string;
            role: string;
        };
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await verifyToken(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const admin = await Admin.findById(user.id).select('-password');

        if (!admin) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            profile: {
                username: admin.username,
                email: admin.email,
                role: admin.role,
                profile_image: admin.profile_image,
                full_name: admin.full_name,
                phone: admin.phone,
                created_at: admin.createdAt,
                last_login: admin.last_login
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await verifyToken(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const formData = await request.formData();
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const full_name = formData.get('full_name') as string;
        const phone = formData.get('phone') as string;
        const profile_image_file = formData.get('profile_image') as File;

        // Check if username already exists (excluding current user)
        const existingUser = await Admin.findOne({
            username,
            _id: { $ne: user.id }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            );
        }

        // Check if email already exists (excluding current user)
        const existingEmail = await Admin.findOne({
            email,
            _id: { $ne: user.id }
        });

        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            );
        }

        let profile_image_url = '';

        // Handle image upload
        if (profile_image_file && profile_image_file.size > 0) {
            const bytes = await profile_image_file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
            await mkdir(uploadsDir, { recursive: true });

            // Generate unique filename
            const extension = profile_image_file.name.split('.').pop();
            const filename = `${user.id}_${Date.now()}.${extension}`;
            const filepath = path.join(uploadsDir, filename);

            // Write file
            await writeFile(filepath, buffer);
            profile_image_url = `/uploads/profiles/${filename}`;
        }

        // Update user profile
        const updateData: any = {
            username,
            email,
            full_name,
            phone
        };

        if (profile_image_url) {
            updateData.profile_image = profile_image_url;
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(
            user.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedAdmin) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: {
                username: updatedAdmin.username,
                email: updatedAdmin.email,
                role: updatedAdmin.role,
                profile_image: updatedAdmin.profile_image,
                full_name: updatedAdmin.full_name,
                phone: updatedAdmin.phone,
                created_at: updatedAdmin.createdAt,
                last_login: updatedAdmin.last_login
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}