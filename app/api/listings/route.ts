import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/lib/models/Listing';
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

        // Apply region filter based on user role
        const regionFilter = getRegionFilter(user);
        Object.assign(query, regionFilter);

        // Search filter
        if (search) {
            const searchFilter = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { seller_no: { $regex: search, $options: 'i' } },
                    { location_display_name: { $regex: search, $options: 'i' } }
                ]
            };
            
            // Combine with existing query
            if (query.$or) {
                query.$and = [
                    { $or: query.$or }, // Region filter
                    searchFilter
                ];
                delete query.$or;
            } else {
                Object.assign(query, searchFilter);
            }
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
            },
            regionFilter: user.role === 'admin' ? user.region : 'All Regions'
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
        const user = await verifyTokenAndGetUser(request);

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

        // Build query with region filter
        const query: any = { _id: id };
        const regionFilter = getRegionFilter(user);
        Object.assign(query, regionFilter);

        const listing = await Listing.findOneAndUpdate(
            query,
            { status },
            { new: true }
        );

        if (!listing) {
            return NextResponse.json(
                { error: 'Listing not found or access denied' },
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
        const user = await verifyTokenAndGetUser(request);

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

        // Managers can delete from any region, so no region filter needed
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