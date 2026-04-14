"use server";

import { vehicleService } from "@/lib/services/vehicle.service";
import { rentalService } from "@/lib/services/rental.service";
import { userService } from "@/lib/services/user.service";
import { adminService } from "@/lib/services/admin.service";
import { getAuthSession, getAdminSession, getProviderSession } from "@/lib/auth";

// Helper to serialize Mongoose documents for passing across boundary
function serialize(obj: any) {
    if (!obj) return obj;
    return JSON.parse(JSON.stringify(obj));
}

// ============================================
// STATUS CHECKS (Providers)
// ============================================

export async function checkMyProviderStatusAction() {
    try {
        const session = await getAuthSession();
        if (!session || !session.id || session.role !== "provider") return null;

        const user = await userService.getUserById(session.id);
        return user?.providerStatus || null;
    } catch (err) {
        return null;
    }
}

// ============================================
// VEHICLES (Public)
// ============================================

export async function getVehicleAction(id: string) {
    try {
        const vehicle = await vehicleService.getVehicleById(id);
        const owner = await userService.getUserById(vehicle.ownerId.toString());
        
        const serializedVehicle = serialize(vehicle);
        if (owner) {
            serializedVehicle.owner = { name: owner.name };
        }
        
        return { data: { vehicle: serializedVehicle } };
    } catch (err: any) {
        return { error: err.message || "Failed to fetch vehicle" };
    }
}

// ============================================
// RENTALS (User)
// ============================================

export async function getUserRentalsAction() {
    try {
        const session = await getAuthSession();
        if (!session || !session.id) return { error: "Unauthorized" };
        
        const rentals = await rentalService.getUserRentals(session.id);
        return { data: { rentals: serialize(rentals) } };
    } catch (err: any) {
        return { error: err.message || "Failed to fetch rentals" };
    }
}

// ============================================
// PROVIDERS
// ============================================

export async function getProviderVehicleAction(id: string) {
    try {
        const session = await getProviderSession();
        const vehicle = await vehicleService.getVehicleById(id);
        
        if (vehicle.ownerId.toString() !== session.id) {
            return { error: "Unauthorized to view this vehicle" };
        }
        
        return { data: { vehicle: serialize(vehicle) } };
    } catch (err: any) {
        return { error: err.message || "Failed to fetch vehicle" };
    }
}

// ============================================
// ADMIN
// ============================================

export async function getAllUsersAction() {
    try {
        await getAdminSession();
        const users = await userService.getAllUsers();
        return { data: { users: serialize(users) } };
    } catch (err: any) {
        return { error: err.message || "Unauthorized" };
    }
}

export async function getAllRentalsAction(status?: string) {
    try {
        await getAdminSession();
        const rentals = await rentalService.getAllRentals(status);
        return { data: serialize(rentals) };
    } catch (err: any) {
        return { error: err.message || "Unauthorized" };
    }
}

export async function getRentalByIdAction(id: string) {
    try {
        await getAdminSession();
        const rental = await rentalService.getRentalById(id);
        return { data: { rental: serialize(rental) } };
    } catch (err: any) {
        return { error: err.message || "Failed to fetch rental" };
    }
}

export async function getProviderByIdAction(id: string) {
    try {
        await getAdminSession();
        const provider = await adminService.getProviderById(id);
        return { data: serialize(provider) };
    } catch (err: any) {
        return { error: err.message || "Failed to fetch provider" };
    }
}
