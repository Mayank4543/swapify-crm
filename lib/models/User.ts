import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    user_password: string;
    email: string;
    user_role?: string;
    user_avatar?: string;
    google_user_id?: string;
    google_user_avatar?: string;
    is_verified?: boolean;
    full_name?: string;
    nickname?: string;
    family_name?: string;
    last_token?: string;
    phone_number?: string;
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    address?: string;
    status?: 'active' | 'inactive' | 'pending';
    segment?: string;
    join_date?: Date;
    last_visit?: Date;
    created_at: Date;
    updatedAt?: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    user_password: { type: String, required: true },
    email: { type: String, required: true },
    user_role: { type: String, default: 'user' },
    user_avatar: { type: String },
    google_user_id: { type: String },
    google_user_avatar: { type: String },
    is_verified: { type: Boolean, default: false },
    full_name: { type: String },
    nickname: { type: String },
    family_name: { type: String },
    last_token: { type: String },
    phone_number: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    pincode: { type: String },
    address: { type: String },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'pending'
    },
    segment: {
        type: String,
        default: 'Standard'
    },
    join_date: {
        type: Date,
        default: Date.now
    },
    last_visit: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // This will automatically handle createdAt and updatedAt
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);