import mongoose, { Schema, Document, Model, models, model } from 'mongoose';

export interface IRental extends Document {
    vehicleId: mongoose.Types.ObjectId;
    renterId: mongoose.Types.ObjectId;
    rentalPeriod: {
        startDate: Date;
        endDate: Date;
    };
    totalCost: number;
    status: 'hold' | 'pending' | 'active' | 'completed' | 'cancelled' | 'failed';
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;

}
const RentalSchema: Schema<IRental> = new Schema(
    {
        vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
        renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rentalPeriod: {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true }
        },
        totalCost: { type: Number, default: 0 },
        status: { 
            type: String, 
            enum: ['hold', 'pending', 'active', 'completed', 'cancelled', 'failed'], 
            default: 'hold' 
        },
        expiresAt: { type: Date, expires: 0 }
    },
    { timestamps: true }
);
const Rental: Model<IRental> = models?.Rental || model<IRental>('Rental', RentalSchema);
export default Rental;