import { Mongoose } from 'mongoose';

declare global {
    // This prevents TypeScript errors when using global.mongoose
    var mongoose: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
    };
}