import mongoose, { Schema, Document, Model, models, model } from 'mongoose';

export interface IOTP extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    otp: string;
    type: 'verification' | 'reset';
    createdAt: Date;
    expiresAt: Date;
    attempts: number;
}

const OTPSchema: Schema<IOTP> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        email: { type: String, required: true },
        otp: { type: String, required: true }, // Hashed OTP
        type: { type: String, enum: ['verification', 'reset'], required: true },
        attempts: { type: Number, default: 0 },
        expiresAt: { 
            type: Date, 
            required: true,
            index: { expires: 0 } // TTL Index
        }
    },
    { timestamps: true }
);

const OTP: Model<IOTP> = models?.OTP || model<IOTP>('OTP', OTPSchema);
export default OTP;
