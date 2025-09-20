import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
    username: string;
    password: string; // hashed
    role: 'manager' | 'admin';
    email: string;
    profile_image?: string;
    full_name?: string;
    phone?: string;
    last_login?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['manager', 'admin'], required: true },
    email: { type: String, required: true, unique: true },
    profile_image: { type: String },
    full_name: { type: String },
    phone: { type: String },
    last_login: { type: Date },
}, {
    timestamps: true
});

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
