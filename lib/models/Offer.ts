import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
    listing: mongoose.Types.ObjectId;
    buyer: mongoose.Types.ObjectId;
    seller: mongoose.Types.ObjectId;
    offerAmount: number;
    contactName: string;
    contactPhone: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    createdAt: Date;
    updatedAt: Date;
}

const OfferSchema: Schema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    offerAmount: {
        type: Number,
        required: true,
        min: 0
    },
    contactName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    contactPhone: {
        type: String,
        required: true,
        trim: true,
        maxLength: 20
    },
    message: {
        type: String,
        required: true,
        maxLength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Index for efficient queries
OfferSchema.index({ listing: 1, createdAt: -1 });
OfferSchema.index({ buyer: 1, createdAt: -1 });
OfferSchema.index({ seller: 1, createdAt: -1 });
OfferSchema.index({ status: 1 });

export default mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);