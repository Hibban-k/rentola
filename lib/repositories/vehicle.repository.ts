import Vehicle, { IVehicle } from "@/models/Vehicle";

export class VehicleRepository {
    async findByOwnerId(ownerId: string): Promise<IVehicle[]> {
        return Vehicle.find({ ownerId });
    }

    async findAll(query: any = {}): Promise<IVehicle[]> {
        return Vehicle.find(query).sort({ createdAt: -1 });
    }

    async findById(id: string): Promise<IVehicle | null> {
        return Vehicle.findById(id);
    }

    async create(data: any): Promise<IVehicle> {
        return Vehicle.create(data);
    }

    async update(id: string, data: any): Promise<IVehicle | null> {
        return Vehicle.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<IVehicle | null> {
        return Vehicle.findByIdAndDelete(id);
    }
}

export const vehicleRepository = new VehicleRepository();
