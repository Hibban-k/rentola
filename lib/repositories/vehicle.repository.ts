import Vehicle, { IVehicle } from "@/models/Vehicle";

export class VehicleRepository {
    async findByOwnerId(ownerId: string): Promise<IVehicle[]> {
        return Vehicle.find({ ownerId });
    }

    async findById(id: string): Promise<IVehicle | null> {
        return Vehicle.findById(id);
    }
}

export const vehicleRepository = new VehicleRepository();
