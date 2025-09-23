import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Offer from '@/lib/models/Offer';
import User from '@/lib/models/User';
import Listing from '@/lib/models/Listing';
import { verifyTokenAndGetUser, getRegionFilter } from '@/lib/auth-helpers';

// GET - List all offers with manually fetched data
export async function GET(request: NextRequest) {
    try {
        const user = await verifyTokenAndGetUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const skip = (page - 1) * limit;

        // Build base query
        let query: any = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        // Get region-filtered listing IDs only (not users)
        const listingRegionFilter = getRegionFilter(user, 'listing');

        let allowedListingIds: string[] = [];

        // If admin, get only listings from their region (but all users)
        if (user.role === 'admin' && user.region) {
            const regionListings = await Listing.find(listingRegionFilter).select('_id').lean();
            allowedListingIds = regionListings.map(l => (l as any)._id.toString());

            // Filter offers to only those involving listings from the admin's region
            if (allowedListingIds.length > 0) {
                query.listing = { $in: allowedListingIds.map(id => new mongoose.Types.ObjectId(id)) };
            } else {
                // No listings in the region, return empty
                return NextResponse.json({
                    offers: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        pages: 0
                    },
                    regionFilter: user.region
                });
            }
        }

        // Handle search functionality
        let searchUserIds: string[] = [];
        let searchListingIds: string[] = [];

        if (search && search.trim()) {
            const searchTerm = search.trim();

            // Search for users (buyers/sellers) by name, username, or email
            // Don't apply region filter to user search - search all users
            const userSearchQuery: any = {
                $or: [
                    { full_name: { $regex: searchTerm, $options: 'i' } },
                    { username: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } }
                ]
            };

            const searchUsers = await User.find(userSearchQuery).select('_id').lean();
            searchUserIds = searchUsers.map(user => (user as any)._id.toString());

            // Search for listings by title or category
            let listingSearchQuery: any = {
                $or: [
                    { title: { $regex: searchTerm, $options: 'i' } },
                    { category: { $regex: searchTerm, $options: 'i' } }
                ]
            };

            // Apply region filter to listing search for admins
            if (user.role === 'admin' && Object.keys(listingRegionFilter).length > 0) {
                listingSearchQuery = { $and: [listingSearchQuery, listingRegionFilter] };
            }

            const searchListings = await mongoose.connection.collection('listings').find(listingSearchQuery).project({ _id: 1 }).toArray();
            searchListingIds = searchListings.map(listing => listing._id.toString());

            // Add search conditions to the main query
            if (searchUserIds.length > 0 || searchListingIds.length > 0) {
                const searchConditions: any[] = [];

                if (searchUserIds.length > 0) {
                    searchConditions.push(
                        { buyer: { $in: searchUserIds.map(id => new mongoose.Types.ObjectId(id)) } },
                        { seller: { $in: searchUserIds.map(id => new mongoose.Types.ObjectId(id)) } }
                    );
                }

                if (searchListingIds.length > 0) {
                    searchConditions.push(
                        { listing: { $in: searchListingIds.map(id => new mongoose.Types.ObjectId(id)) } }
                    );
                }

                if (query.$or) {
                    query.$and = [
                        { $or: query.$or },
                        { $or: searchConditions }
                    ];
                    delete query.$or;
                } else {
                    query.$or = searchConditions;
                }
            } else {
                // If no users or listings found, return empty results
                return NextResponse.json({
                    offers: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        pages: 0
                    },
                    regionFilter: user.role === 'admin' ? `${user.region} (Listings Only)` : 'All Regions'
                });
            }
        }

        // Get basic offers without populate
        const offers = await Offer.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        if (offers.length === 0) {
            return NextResponse.json({
                offers: [],
                pagination: {
                    page,
                    limit,
                    total: await Offer.countDocuments(query),
                    pages: 0
                },
                regionFilter: user.role === 'admin' ? user.region : 'All Regions'
            });
        }

        // Get unique user and listing IDs
        const userIds = [...new Set([
            ...offers.map(offer => offer.buyer.toString()),
            ...offers.map(offer => offer.seller.toString())
        ])];
        const listingIds = [...new Set(offers.map(offer => offer.listing.toString()))];

        // Fetch users and listings in parallel
        const [users, listings] = await Promise.all([
            User.find({ _id: { $in: userIds } }).lean(),
            mongoose.connection.collection('listings').find({ _id: { $in: listingIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray()
        ]);

        // Create lookup maps
        const userMap = users.reduce((map, user: any) => {
            map[user._id.toString()] = user;
            return map;
        }, {} as Record<string, any>);

        const listingMap = listings.reduce((map, listing: any) => {
            map[listing._id.toString()] = listing;
            return map;
        }, {} as Record<string, any>);

        // Combine data
        const enrichedOffers = offers.map(offer => ({
            ...offer,
            buyer: userMap[offer.buyer.toString()] || null,
            seller: userMap[offer.seller.toString()] || null,
            listing: listingMap[offer.listing.toString()] || null
        }));

        const total = await Offer.countDocuments(query);

        return NextResponse.json({
            offers: enrichedOffers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            regionFilter: user.role === 'admin' ? `${user.region} (Listings Only)` : 'All Regions'
        });

    } catch (error) {
        console.error('Get offers error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// PUT - Update offer status
export async function PUT(request: NextRequest) {
    try {
        const user = await verifyTokenAndGetUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();
        const { offerId, status } = await request.json();

        if (!offerId || !status) {
            return NextResponse.json(
                { error: 'Offer ID and status are required' },
                { status: 400 }
            );
        }

        if (!['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        // For admins, check if they have access to this offer based on listing region only
        let query: any = { _id: offerId };
        
        if (user.role === 'admin' && user.region) {
            // Get the offer first to check the associated listing
            const offer = await Offer.findById(offerId).lean();
            if (!offer) {
                return NextResponse.json(
                    { error: 'Offer not found' },
                    { status: 404 }
                );
            }

            // Check if the offer involves listings from the admin's region
            const listingRegionFilter = getRegionFilter(user, 'listing');

            const regionListings = await Listing.find(listingRegionFilter).select('_id').lean();
            const allowedListingIds = regionListings.map(l => (l as any)._id.toString());

            const hasAccess = allowedListingIds.includes((offer as any).listing.toString());

            if (!hasAccess) {
                return NextResponse.json(
                    { error: 'Access denied - Offer listing not in your region' },
                    { status: 403 }
                );
            }
        }

        const updatedOffer = await Offer.findByIdAndUpdate(
            offerId,
            { status },
            { new: true }
        ).lean();

        if (!updatedOffer) {
            return NextResponse.json(
                { error: 'Offer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Offer status updated successfully',
            offer: updatedOffer
        });

    } catch (error) {
        console.error('Update offer error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete offer (Manager only)
export async function DELETE(request: NextRequest) {
    try {
        const user = await verifyTokenAndGetUser(request);
        if (!user || user.role !== 'manager') {
            return NextResponse.json(
                { error: 'Forbidden - Manager access required' },
                { status: 403 }
            );
        }

        await dbConnect();
        const { offerId } = await request.json();

        if (!offerId) {
            return NextResponse.json(
                { error: 'Offer ID is required' },
                { status: 400 }
            );
        }

        // Managers can delete offers from any region
        const result = await Offer.findByIdAndDelete(offerId);

        if (!result) {
            return NextResponse.json(
                { error: 'Offer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Offer deleted successfully'
        });

    } catch (error) {
        console.error('Delete offer error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}