import Rental, { IRental } from "@/models/Rental";

export class RentalRepository {
    async findByRenterId(renterId: string): Promise<IRental[]> {
        return Rental.find({ renterId })
            .populate("vehicleId", "name type pricePerDay vehicleImageUrl")
            .sort({ createdAt: -1 })
            .lean();
    }

    async findOverlappingRental(vehicleId: string, start: Date, end: Date): Promise<IRental | null> {
        return Rental.findOne({
            vehicleId,
            status: { $ne: 'cancelled' },
            "rentalPeriod.startDate": { $lt: end },
            "rentalPeriod.endDate": { $gt: start }
        });
    }

    async create(data: Partial<IRental>): Promise<IRental> {
        return Rental.create(data);
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
            endDate: { $lt: now }
        });
    }

    async updateStatus(id: string, status: string): Promise<IRental | null> {
        return Rental.findByIdAndUpdate(id, { status }, { new: true });
    }
}

export const rentalRepository = new RentalRepository();
