import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Listing from '@/lib/models/Listing';

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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const status = searchParams.get('status') || '';
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        await dbConnect();

        // Build query
        const query: any = {};

        // Include/exclude deleted items
        if (!includeDeleted) {
            query.deleted = { $ne: true };
        }

        // Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { seller_no: { $regex: search, $options: 'i' } },
                { location_display_name: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Fetch listings with pagination
        const [listings, totalCount] = await Promise.all([
            Listing.find(query)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Listing.countDocuments(query)
        ]);

        return NextResponse.json({
            listings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasNextPage: page * limit < totalCount,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Listings fetch error:', error);
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

        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await dbConnect();

        const listing = await Listing.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!listing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Listing status updated successfully',
            listing
        });

    } catch (error) {
        console.error('Listing update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await verifyToken(request);

        if (!user || user.role !== 'manager') {
            return NextResponse.json(
                { error: 'Unauthorized - Manager access required' },
                { status: 401 }
            );
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Listing ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const listing = await Listing.findByIdAndUpdate(
            id,
            { deleted: true },
            { new: true }
        );

        if (!listing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Listing deleted successfully'
        });

    } catch (error) {
        console.error('Listing delete error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}