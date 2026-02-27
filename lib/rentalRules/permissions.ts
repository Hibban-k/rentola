import Vehicle from "@/models/Vehicle";

/**
 * Handles resource ownership and role-based access control.
 */

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

/**
 * Check if a user with a specific role can cancel a rental with a certain status
 */
export function canCancelRental(
    role: "user" | "provider" | "admin" | string,
    status: "pending" | "active" | "completed" | "cancelled" | string
): boolean {
    if (role === "admin") return true;

    if (role === "provider" && (status === "pending" || status === "active")) {
        return true;
    }

    if (role === "user" && status === "pending") {
        return true;
    }

    return false;
}
