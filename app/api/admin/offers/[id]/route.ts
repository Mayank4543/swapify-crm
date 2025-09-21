import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Offer from '@/lib/models/Offer';
import User from '@/lib/models/User';
import Listing from '@/lib/models/Listing';

// Force this API route to use Node.js runtime
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret';

// Middleware to verify authentication
async function verifyAuth(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return decoded;
    } catch {
        return null;
    }
}

// GET - Get single offer details
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

        const offerId = params.id;

        if (!mongoose.Types.ObjectId.isValid(offerId)) {
            return NextResponse.json(
                { error: 'Invalid offer ID' },
                { status: 400 }
            );
        }

        // Get the offer
        const offer = await Offer.findById(offerId).lean();

        if (!offer) {
            return NextResponse.json(
                { error: 'Offer not found' },
                { status: 404 }
            );
        }

        // Get buyer, seller, and listing data
        const [buyer, seller, listing] = await Promise.all([
            User.findById((offer as any).buyer).lean(),
            User.findById((offer as any).seller).lean(),
            mongoose.connection.collection('listings').findOne({ _id: new mongoose.Types.ObjectId((offer as any).listing.toString()) })
        ]);

        // Combine the data
        const enrichedOffer = {
            ...offer,
            buyer: buyer || null,
            seller: seller || null,
            listing: listing || null
        };

        return NextResponse.json({
            offer: enrichedOffer
        });

    } catch (error) {
        console.error('Get offer details error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}