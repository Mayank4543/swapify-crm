import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
    _id: string;
    title: string;
    seller_id: string;
    seller_no: string;
    category_id?: string;
    price: number;
    description: string;
    cover_image: string;
    additional_images?: string[];
    category: string;
    subcategory?: string;
    location_display_name?: string;
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    created_at: Date;
    deleted: boolean;
    status: 'draft' | 'pending_review' | 'active' | 'paused' | 'reserved' | 'sold' | 'cancelled' | 'expired' | 'archived';
    expires_at?: Date;
    currency: 'INR';
    __v?: number;
    // GeoJSON location field (for newer records)
    location?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
}

const ListingSchema: Schema = new Schema({
    title: { type: String, required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller_no: { type: String, required: true },
    category_id: { type: String },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    cover_image: { type: String, required: true },
    additional_images: [{ type: String }],
    category: { type: String, required: true },
    subcategory: { type: String },
    location_display_name: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    pincode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    created_at: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },

    // status
    status: {
        type: String,
        enum: ['draft', 'pending_review', 'active', 'paused', 'reserved', 'sold', 'cancelled', 'expired', 'archived'],
        default: 'pending_review',
        index: true
    },
    expires_at: { type: Date },

    // Pricing
    currency: {
        type: String,
        enum: ['INR'], // restrict to INR for now; expand later if multi-currency
        default: 'INR'
    },

    // GeoJSON location field (optional for backward compatibility)
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number]
        }
    },

    __v: { type: Number }
}, {
    collection: 'listings' // Make sure it uses the correct collection name
});

// Create a 2dsphere index for geospatial queries (only if location field exists)
ListingSchema.index({ location: "2dsphere" }, { sparse: true });

// Create a text index for text search with field weights
ListingSchema.index({
    title: 'text',
    description: 'text',
    location_display_name: 'text',
    city: 'text',
    state: 'text'
}, {
    weights: {
        title: 10,
        description: 5,
        location_display_name: 3,
        city: 2,
        state: 1
    },
    name: "TextSearchIndex"
});

// Create a compound index for common queries
ListingSchema.index({
    deleted: 1,
    created_at: -1
});

// Create indexes for latitude/longitude (for backward compatibility)
ListingSchema.index({ latitude: 1, longitude: 1 }, { sparse: true });

export default mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema);