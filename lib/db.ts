import mongoose from 'mongoose';

const MONGO_URL = process.env.NEXT_MONGO_URL;

if (!MONGO_URL) {
    throw new Error('Please define the NEXT_MONGO_URL environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URL, {
            bufferCommands: false,
        }).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
