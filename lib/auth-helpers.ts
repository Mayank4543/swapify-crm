import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface AuthUser {
    id: string;
    username: string;
    role: 'manager' | 'admin';
    email: string;
    region?: string;
}

export async function verifyTokenAndGetUser(request: NextRequest): Promise<AuthUser | null> {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        if (!decoded.id) {
            return null;
        }

        await dbConnect();
        
        // Get the latest admin data from database to include region
        const admin = await Admin.findById(decoded.id).select('username email role region');
        
        if (!admin) {
            return null;
        }

        return {
            id: admin._id.toString(),
            username: admin.username,
            role: admin.role,
            email: admin.email,
            region: admin.region
        };
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

export function getRegionFilter(user: AuthUser, modelType: 'listing' | 'user' = 'listing'): any {
    // Managers have access to all regions, no filter needed
    if (user.role === 'manager') {
        return {};
    }
    
    // Users should NOT be filtered by region - show all users
    if (modelType === 'user') {
        return {}; // No region filtering for users
    }
    
    // Only filter listings by region for admins
    if (user.role === 'admin' && user.region && modelType === 'listing') {
        return {
            $or: [
                { city: { $regex: user.region, $options: 'i' } },
                { state: { $regex: user.region, $options: 'i' } },
                { location_display_name: { $regex: user.region, $options: 'i' } },
                // Also check if the region is contained within these fields (for specific localities)
                { city: { $regex: `.*${user.region}.*`, $options: 'i' } },
                { location_display_name: { $regex: `.*${user.region}.*`, $options: 'i' } },
                // Reverse check - if user region contains the location
                { $expr: { 
                    $regexMatch: { 
                        input: user.region, 
                        regex: { $concat: [".*", "$city", ".*"] }, 
                        options: "i" 
                    } 
                }},
                { $expr: { 
                    $regexMatch: { 
                        input: user.region, 
                        regex: { $concat: [".*", "$location_display_name", ".*"] }, 
                        options: "i" 
                    } 
                }}
            ]
        };
    }
    
    // If admin has no region set for listings, return empty result
    if (modelType === 'listing') {
        return { _id: null };
    }
    
    // Default case - no filtering
    return {};
}