import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Listing from '@/lib/models/Listing';

// Force this API route to use Node.js runtime
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret';

// Middleware to verify authentication
async function verifyAuth(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
            request.cookies.get('auth-token')?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
        return decoded;
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

// GET - Get single listing details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const listingId = params.id;

        if (!mongoose.Types.ObjectId.isValid(listingId)) {
            return NextResponse.json(
                { error: 'Invalid listing ID' },
                { status: 400 }
            );
        }

        // Get the listing
        const listing = await Listing.findById(listingId).lean();

        if (!listing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            listing: listing
        });

    } catch (error) {
        console.error('Get listing details error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// PUT - Update listing status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const listingId = params.id;
        const { status } = await request.json();

        if (!mongoose.Types.ObjectId.isValid(listingId)) {
            return NextResponse.json(
                { error: 'Invalid listing ID' },
                { status: 400 }
            );
        }

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        const validStatuses = ['draft', 'pending_review', 'active', 'paused', 'reserved', 'sold', 'cancelled', 'expired', 'archived'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            listingId,
            { status },
            { new: true }
        ).lean();

        if (!updatedListing) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Listing status updated successfully',
            listing: updatedListing
        });

    } catch (error) {
        console.error('Update listing error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete listing (Manager only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (user.role !== 'manager') {
            return NextResponse.json(
                { error: 'Forbidden - Manager access required' },
                { status: 403 }
            );
        }

        await dbConnect();

        const listingId = params.id;

        if (!mongoose.Types.ObjectId.isValid(listingId)) {
            return NextResponse.json(
                { error: 'Invalid listing ID' },
                { status: 400 }
            );
        }

        const result = await Listing.findByIdAndDelete(listingId);

        if (!result) {
            return NextResponse.json(
                { error: 'Listing not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Listing deleted successfully'
        });

    } catch (error) {
        console.error('Delete listing error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}