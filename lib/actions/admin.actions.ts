"use server"

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { adminService } from "@/lib/services/admin.service";
import { ActionResponse } from "@/types";

/**
 * Server Action to approve a provider request.
 */
export async function approveProviderAction(
    prevState: any,
    providerId: string
): Promise<ActionResponse> {
    try {
        const user = await getAuthSession();
        if (!user || user.role !== "admin") {
            return { success: false, error: "Unauthorized: Admin access required" };
        }

        await adminService.approveProvider(providerId);

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/providers");

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to approve provider" };
    }
}

/**
 * Server Action to reject a provider request.
 */
export async function rejectProviderAction(
    prevState: any,
    providerId: string
): Promise<ActionResponse> {
    try {
        const user = await getAuthSession();
        if (!user || user.role !== "admin") {
            return { success: false, error: "Unauthorized: Admin access required" };
        }

        await adminService.rejectProvider(providerId);

        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/providers");

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to reject provider" };
    }
}
