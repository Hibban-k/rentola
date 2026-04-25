import { vehicleRepository } from "../repositories/vehicle.repository";
import { rentalRepository } from "../repositories/rental.repository";
import { connectToDatabase } from "@/lib/db";
import { CreateVehiclePayload, VehicleFilters } from "@/types";

export class VehicleService {
    async getAllVehicles(filters: VehicleFilters) {
        await connectToDatabase();
        const query: any = { isAvailable: true };

        if (filters.type) {
            query.type = filters.type;
        }

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                { pickupStation: { $regex: filters.search, $options: "i" } }
            ];
        }

        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            // Ignore past queries or invalid dates gracefully
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const bookedRentals = await rentalRepository.findOverlappingRentals(start, end);
                const bookedVehicleIds = bookedRentals.map((r: any) => r.vehicleId.toString());
                
                if (bookedVehicleIds.length > 0) {
                    query._id = { $nin: bookedVehicleIds };
                }
            }
        }

        return vehicleRepository.findAll(query);
    }

    async getVehicleById(id: string) {
        await connectToDatabase();
        const vehicle = await vehicleRepository.findById(id);
        if (!vehicle) {
            throw { status: 404, message: "Vehicle not found" };
        }
        return vehicle;
    }

    async getProviderVehicles(ownerId: string) {
        await connectToDatabase();
        return vehicleRepository.findByOwnerId(ownerId);
    }

    async createVehicle(ownerId: string, payload: CreateVehiclePayload) {
        await connectToDatabase();
        return vehicleRepository.create({
            ...payload,
            ownerId,
        });
    }

    async updateVehicle(id: string, ownerId: string, updateData: any) {
        await connectToDatabase();
        const vehicle = await vehicleRepository.findById(id);

        if (!vehicle) {
            throw { status: 404, message: "Vehicle not found" };
        }

        if (vehicle.ownerId.toString() !== ownerId) {
            throw { status: 403, message: "Unauthorized to update this vehicle" };
        }

        return vehicleRepository.update(id, updateData);
    }

    async deleteVehicle(id: string, ownerId: string) {
        await connectToDatabase();
        const vehicle = await vehicleRepository.findById(id);

        if (!vehicle) {
            throw { status: 404, message: "Vehicle not found" };
        }

        if (vehicle.ownerId.toString() !== ownerId) {
            throw { status: 403, message: "Unauthorized to delete this vehicle" };
        }

        return vehicleRepository.delete(id);
    }
}

export const vehicleService = new VehicleService();
