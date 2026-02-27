"use server"

import { rentalService } from "@/lib/services/rental.service";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types";

/**
 * Server Action to create a new rental.
 */
export async function createRentalAction(
    prevState: any,
    payload: { vehicleId: string; startDate: string; endDate: string }
): Promise<ActionResponse> {
    try {
        const user = await getAuthSession();
        if (!user) {
            return { success: false, error: "You must be logged in to book a vehicle" };
        }

        const rental = await rentalService.createRental(user.id!, payload);

        // Revalidate the user's rentals list and the vehicle detail page (availability might change)
        revalidatePath("/user/rentals");
        revalidatePath(`/vehicles/${payload.vehicleId}`);
        revalidatePath(`/vehicles/${payload.vehicleId}/book`);

        return {
            success: true,
            data: JSON.parse(JSON.stringify(rental))
        };
    } catch (error: any) {
        console.error("[createRentalAction] Error:", error);
        return {
            success: false,
            error: error.message || "Failed to book vehicle"
        };
    }
}

/**
 * Server Action to cancel a rental.
 */
export async function cancelRentalAction(
    prevState: any,
    rentalId: string
): Promise<ActionResponse> {
    try {
        const user = await getAuthSession();
        if (!user) return { success: false, error: "Unauthorized" };

        await rentalService.updateRentalStatus(rentalId, "cancelled", user.id!, "user");

        revalidatePath("/user/rentals");
        revalidatePath("/provider/dashboard"); // If the provider sees this rental

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to cancel rental" };
    }
}

/**
 * Server Action to accept a rental (provider).
 */
export async function acceptRentalAction(
    prevState: any,
    rentalId: string
): Promise<ActionResponse> {
    try {
        const user = await getAuthSession();
        if (!user) return { success: false, error: "Unauthorized" };

        await rentalService.updateRentalStatus(rentalId, "active", user.id!, "provider");

        revalidatePath("/provider/dashboard");
        revalidatePath("/user/rentals");

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to accept rental" };
    }
}

/**
 * Server Action to reject a rental (provider).
 */
export async function rejectRentalAction(
    prevState: any,
    rentalId: string
): Promise<ActionResponse> {
    try {
        const user = await getAuthSession();
        if (!user) return { success: false, error: "Unauthorized" };

        await rentalService.updateRentalStatus(rentalId, "cancelled", user.id!, "provider");

        revalidatePath("/provider/dashboard");
        revalidatePath("/user/rentals");

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to reject rental" };
    }
}
