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
        if (status && ["pending", "approved", "rejected", "active", "completed", "cancelled"].includes(status)) {
            query.status = status;
        }
        return Rental.find(query)
            .populate("vehicleId", "name vehicleImageUrl pricePerDay type")
            .populate("renterId", "name email")
            .sort({ createdAt: -1 })
            .lean();
    }

    async findOverlappingRental(vehicleId: string, start: Date, end: Date): Promise<IRental | null> {
        return Rental.findOne({
            vehicleId,
            status: { $nin: ['cancelled', 'rejected'] },
            "rentalPeriod.startDate": { $lt: end },
            "rentalPeriod.endDate": { $gt: start }
        });
    }

    async findOverlappingVehicleIds(start: Date, end: Date): Promise<string[]> {
        const rentals = await Rental.find({
            status: { $in: ['active', 'approved', 'pending'] },
            "rentalPeriod.startDate": { $lt: end },
            "rentalPeriod.endDate": { $gt: start }
        }).select('vehicleId').lean();
        
        return rentals.map(r => r.vehicleId.toString());
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
        return Rental.findByIdAndUpdate(id, { status }, { new: true, session });
    }
}

export const rentalRepository = new RentalRepository();
