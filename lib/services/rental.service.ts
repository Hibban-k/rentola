import { rentalRepository } from "../repositories/rental.repository";
import { vehicleRepository } from "../repositories/vehicle.repository";
import { getVehicleWithOwnership } from "@/lib/rentalRules/permissions";
import { canCreateRental } from "@/lib/rentalRules/guards";
import { connectToDatabase } from "@/lib/db";
import { IRental } from "@/models/Rental";

export class RentalService {
    async getUserRentals(userId: string) {
        await connectToDatabase();
        return rentalRepository.findByRenterId(userId);
    }

    async getProviderRentals(providerId: string) {
        await connectToDatabase();
        const vehicles = await vehicleRepository.findByOwnerId(providerId);

        if (vehicles.length === 0) {
            return [];
        }

        const vehicleIds = vehicles.map(v => (v._id as any).toString());
        return rentalRepository.findByVehicleIds(vehicleIds);
    }

    async createRental(userId: string, payload: { vehicleId: string; startDate: string; endDate: string }) {
        await connectToDatabase();
        const { vehicleId, startDate, endDate } = payload;

        // 1. Ownership & Permission check
        const { vehicle, isOwner } = await getVehicleWithOwnership(vehicleId, userId);
        if (!vehicle) {
            throw { status: 404, message: "Vehicle not found" };
        }

        const rentalCheck = canCreateRental(isOwner);
        if (!rentalCheck.allowed) {
            throw { status: 400, message: rentalCheck.reason };
        }

        // 2. Availability check
        if (!vehicle.isAvailable) {
            throw { status: 400, message: "Vehicle is currently unavailable for rent" };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // 3. Double booking check
        const existingRental = await rentalRepository.findOverlappingRental(vehicleId, start, end);
        if (existingRental) {
            throw { status: 409, message: "Vehicle is already booked for these dates" };
        }

        // 4. Calculate Total Cost
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const platformFee = 9;
        const totalCost = (days * vehicle.pricePerDay) + platformFee;

        // 5. Create the rental
        return rentalRepository.create({
            vehicleId: vehicleId as any,
            renterId: userId as any,
            rentalPeriod: {
                startDate: start,
                endDate: end,
            },
            totalCost,
        });
    }

    async getRentalById(id: string) {
        await connectToDatabase();
        const rental = await rentalRepository.findById(id);
        if (!rental) {
            throw { status: 404, message: "Rental not found" };
        }
        return rental;
    }

    async updateRentalStatus(id: string, status: IRental["status"], userId: string, role: "user" | "provider" | "admin") {
        await connectToDatabase();
        // Repository handles the validation checks via its updateStatus, 
        // but we could also add domain rules here if needed in the future.
        return rentalRepository.updateStatus(id, status);
    }

    async completeExpiredRentals() {
        await connectToDatabase();
        const now = new Date();
        const expiredRentals = await rentalRepository.findActiveExpired(now);

        const results = await Promise.all(
            expiredRentals.map(rental =>
                rentalRepository.updateStatus((rental._id as any).toString(), "completed")
            )
        );

        return {
            processed: expiredRentals.length,
            success: results.filter(r => r !== null).length
        };
    }
}

export const rentalService = new RentalService();
