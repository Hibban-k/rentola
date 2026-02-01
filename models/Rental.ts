import mongoose, { Schema, Document,Model,models, model } from 'mongoose';

export interface IRental extends Document {
    vehicleId: mongoose.Types.ObjectId;
    renterId: mongoose.Types.ObjectId;
    pickupLocation: string;
    dropOffLocation: string;
    rentalPeriod: {
        startDate: Date;
        endDate: Date;
    };
    totalCost: number;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;

}
const RentalSchema: Schema<IRental> = new Schema(
    {
        vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
        renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        pickupLocation: { type: String, required: true },
        dropOffLocation: { type: String, required: true },
        rentalPeriod: {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true }
        },
        totalCost: { type: Number, default: 0 },
        status:{ type:String, enum:['pending','active','completed','cancelled'], default:'pending'},
    },
    { timestamps:true }
);
const Rental: Model<IRental> = models?.Rental || model<IRental>('Rental', RentalSchema);
export default Rental;