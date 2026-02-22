import { vehicleRepository } from "../repositories/vehicle.repository";
import { connectToDatabase } from "@/lib/db";
import { CreateVehiclePayload, VehicleFilters } from "@/types";
import Vehicle from "@/models/Vehicle";

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

        return Vehicle.find(query).sort({ createdAt: -1 });
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
        return Vehicle.create({
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

        return Vehicle.findByIdAndUpdate(id, updateData, { new: true });
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

        return Vehicle.findByIdAndDelete(id);
    }
}

export const vehicleService = new VehicleService();
