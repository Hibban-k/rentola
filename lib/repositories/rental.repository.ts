import Rental, { IRental } from "@/models/Rental";

export class RentalRepository {
    async findByRenterId(renterId: string): Promise<IRental[]> {
        return Rental.find({ renterId })
            .populate("vehicleId", "name type pricePerDay vehicleImageUrl")
            .sort({ createdAt: -1 })
            .lean();
    }

    async findAllRentals(status?: string): Promise<IRental[]> {
        const query: any = {};
        if (status && ["hold", "pending", "approved", "rejected", "active", "completed", "cancelled", "failed"].includes(status)) {
            query.status = status;
        }
        return Rental.find(query)
            .populate("vehicleId", "name vehicleImageUrl pricePerDay type")
            .populate("renterId", "name email")
            .sort({ createdAt: -1 })
            .lean();
    }

    async findOverlappingRentals(start: Date, end: Date, vehicleId?: string, session?: any): Promise<IRental[]> {
        const query: any = {
            status: { $in: ['active', 'pending', 'hold'] },
            "rentalPeriod.startDate": { $lt: end },
            "rentalPeriod.endDate": { $gt: start }
        };
        if (vehicleId) query.vehicleId = vehicleId;
        
        return Rental.find(query).session(session);
    }

    async create(data: Partial<IRental>, session?: any): Promise<IRental> {
        const rental = new Rental(data);
        return rental.save({ session });
    }

    async findByVehicleIds(vehicleIds: string[]): Promise<IRental[]> {
        return Rental.find({
            vehicleId: { $in: vehicleIds }
        }).populate("vehicleId");
    }

    async findById(id: string): Promise<IRental | null> {
        return Rental.findById(id).populate("vehicleId").populate("renterId");
    }

    async findActiveExpired(now: Date): Promise<IRental[]> {
        return Rental.find({
            status: "active",
            "rentalPeriod.endDate": { $lt: now }
        });
    }

    async updateStatus(id: string, status: string, session?: any): Promise<IRental | null> {
        const update: any = { 
            $set: { status } 
        };
        
        // Only clear the TTL if the booking is successfully confirmed or active
        // This ensures abandoned (hold) and unsuccessful (failed) bookings are still cleaned up
        if (["pending", "active", "completed"].includes(status)) {
            update.$unset = { expiresAt: 1 };
        }
        
        return Rental.findByIdAndUpdate(id, update, { new: true, session });
    }

    async delete(id: string, session?: any): Promise<void> {
        await Rental.findByIdAndDelete(id, { session });
    }
}

export const rentalRepository = new RentalRepository();
