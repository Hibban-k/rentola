import mongoose, { Schema, Document, Model, models, model } from 'mongoose';

export interface IPayment extends Document {
    rentalId: mongoose.Types.ObjectId;
    renterId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: 'pending' | 'success' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
    {
        rentalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', required: true },
        renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        razorpayOrderId: { type: String, required: true, unique: true },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        status: { 
            type: String, 
            enum: ['pending', 'success', 'failed'], 
            default: 'pending'
        },
    },
    { timestamps: true }
);

const Payment: Model<IPayment> = models?.Payment || model<IPayment>('Payment', PaymentSchema);
export default Payment;
