"use server"

import { vehicleService } from "@/lib/services/vehicle.service";
import { getProviderSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CreateVehiclePayload, ActionResponse } from "@/types";

/**
 * Server Action to create a new vehicle.
 * Validates the provider session and delegates to the VehicleService.
 */
export async function createVehicleAction(
    prevState: any,
    payload: CreateVehiclePayload
): Promise<ActionResponse> {
    try {
        const user = await getProviderSession();

        const vehicle = await vehicleService.createVehicle(user.id!, payload);

        // Revalidate the vehicles list and provider dashboard
        revalidatePath("/vehicles");
        revalidatePath("/provider/dashboard");

        return {
            success: true,
            data: JSON.parse(JSON.stringify(vehicle))
        };
    } catch (error: any) {
        console.error("[createVehicleAction] Error:", error);
        return {
            success: false,
            error: error.message || "Failed to create vehicle"
        };
    }
}

/**
 * Server Action to toggle vehicle availability.
 */
export async function updateVehicleAvailabilityAction(
    prevState: any,
    payload: { id: string; isAvailable: boolean }
): Promise<ActionResponse> {
    try {
        const user = await getProviderSession();

        await vehicleService.updateVehicle(payload.id, user.id!, {
            isAvailable: payload.isAvailable
        });

        revalidatePath("/provider/dashboard");
        revalidatePath("/vehicles");
        revalidatePath(`/vehicles/${payload.id}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update availability" };
    }
}

/**
 * Server Action to delete a vehicle.
 */
export async function deleteVehicleAction(
    prevState: any,
    vehicleId: string
): Promise<ActionResponse> {
    try {
        const user = await getProviderSession();

        await vehicleService.deleteVehicle(vehicleId, user.id!);

        revalidatePath("/provider/dashboard");
        revalidatePath("/vehicles");

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to delete vehicle" };
    }
}
