import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    user_password: string;
    email: string;
    aadhaar_data?: string; // ObjectId reference
    user_role?: 'user' | 'admin';
    user_avatar?: string;
    phone_number?: string;
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    address?: string;
    created_at: Date;
    last_token?: string;
    google_user_id?: string;
    google_user_avatar?: string;
    is_verified?: boolean;
    email_verified?: boolean;
    full_name?: string;
    nickname?: string;
    family_name?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    // Additional CRM fields
    status?: 'active' | 'inactive' | 'pending';
    segment?: string;
    join_date?: Date;
    last_visit?: Date;
    updatedAt?: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    user_password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    aadhaar_data: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AadhaarData',
        unique: true,
        sparse: true
    },
    user_role: { type: String, enum: ['user', 'admin'], default: 'user' },
    user_avatar: { type: String },
    phone_number: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    pincode: { type: String },
    address: { type: String },
    created_at: { type: Date, default: Date.now },
    last_token: {
        type: String,
        default: null
    },
    google_user_id: { type: String },
    google_user_avatar: { type: String },
    is_verified: { type: Boolean },
    email_verified: { type: Boolean },
    full_name: { type: String },
    nickname: { type: String },
    family_name: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // Additional CRM fields for backward compatibility
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
    }
}, {
    timestamps: true,
    collection: 'users' // Ensure it uses the correct collection name
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);