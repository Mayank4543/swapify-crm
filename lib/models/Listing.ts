import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
    _id: string;
    title: string;
    seller_id: string;
    seller_no: string;
    price: number;
    description: string;
    cover_image: string;
    additional_images: string[];
    category: string;
    subcategory?: string;
    category_id?: string;
    location_display_name?: string;
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    location?: object;
    deleted: boolean;
    status: string;
    currency: string;
    created_at: Date;
    __v?: number;
}

const ListingSchema: Schema = new Schema({
    title: { type: String, required: true },
    seller_id: { type: String, required: true },
    seller_no: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    cover_image: { type: String, required: true },
    additional_images: { type: [String], default: [] },
    category: { type: String, required: true },
    subcategory: { type: String },
    category_id: { type: String },
    location_display_name: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    pincode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    location: { type: Object },
    deleted: { type: Boolean, default: false },
    status: { type: String, required: true, default: 'active' },
    currency: { type: String, required: true, default: 'INR' },
    created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema);