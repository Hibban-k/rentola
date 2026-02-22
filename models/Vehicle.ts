import mongoose, { Schema, Document, Model, models, model } from 'mongoose';

export interface IVehicle extends Document {
    name: string;
    type: 'car' | 'bike';
    licensePlate: string;
    pricePerDay: number
    ownerId: mongoose.Types.ObjectId;
    vehicleImageUrl: {
        type: string;
        url: string;
    }[];
    pickupStation: string;
    createdAt: Date;
    updatedAt: Date;
    isAvailable: boolean;
};
const VehicleSchema: Schema<IVehicle> = new Schema(
    {
        name: { type: String, required: true },
        type: { type: String, enum: ['car', 'bike'], required: true },
        licensePlate: { type: String, required: true },
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        pricePerDay: { type: Number, required: true },
        vehicleImageUrl: [
            {
                type: { type: String, required: true },
                url: { type: String, required: true }
            }
        ],
        pickupStation: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Indexes for performance
VehicleSchema.index({ isAvailable: 1 });
VehicleSchema.index({ type: 1 });
VehicleSchema.index({ pricePerDay: 1 });
VehicleSchema.index({ name: 'text' });
VehicleSchema.index({ createdAt: -1 });

const Vehicle: Model<IVehicle> = models?.Vehicle || model<IVehicle>('Vehicle', VehicleSchema);
export default Vehicle;