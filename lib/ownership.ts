// lib/ownership.ts → is this resource yours?

import Vehicle from "@/models/Vehicle";

/**
 * Check if the user is the owner of the vehicle
 */
export async function isVehicleOwner(vehicleId: string, userId: string): Promise<boolean> {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        return false;
    }
    return vehicle.ownerId.toString() === userId;
}

/**
 * Get vehicle and check ownership - returns vehicle if found, null otherwise
 * Also returns whether the user is the owner
 */
export async function getVehicleWithOwnership(vehicleId: string, userId: string) {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        return { vehicle: null, isOwner: false };
    }
    return {
        vehicle,
        isOwner: vehicle.ownerId.toString() === userId
    };
}
