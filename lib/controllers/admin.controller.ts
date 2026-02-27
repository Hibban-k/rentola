import { NextRequest, NextResponse } from "next/server";
import { adminService } from "../services/admin.service";
import { getAdminSession } from "@/lib/auth";

export class AdminController {
    /**
     * Handle POST /api/admin/providers
     */
    async handleProviderStatus(request: NextRequest) {
        try {
            await getAdminSession();
            const { userId, status } = await request.json();

            if (status === "approved") {
                await adminService.approveProvider(userId);
            } else if (status === "rejected") {
                await adminService.rejectProvider(userId);
            } else {
                return NextResponse.json({ error: "Invalid status" }, { status: 400 });
            }

            return NextResponse.json({ success: true, message: `Provider ${status}` }, { status: 200 });
        } catch (error: any) {
            console.error("[AdminController.handleProviderStatus]", error);
            return NextResponse.json(
                { error: error.message || "Unauthorized" },
                { status: error.status || 401 }
            );
        }
    }

    /**
     * Handle GET /api/admin/providers
     */
    async getProviders(request: NextRequest) {
        try {
            await getAdminSession();
            const { searchParams } = new URL(request.url);
            const status = searchParams.get("status");

            // For now, "providers" are anyone who has a providerStatus
            // In a real app, you might want to filter by role or a boolean
            const allUsers = await adminService.getAllProviders();

            let providers = allUsers.filter(u => u.providerStatus !== undefined);

            if (status && status !== "all") {
                providers = providers.filter(p => p.providerStatus === status);
            }

            return NextResponse.json(providers);
        } catch (error: any) {
            console.error("[AdminController.getProviders]", error);
            return NextResponse.json(
                { error: error.message || "Unauthorized" },
                { status: error.status || 401 }
            );
        }
    }
}

export const adminController = new AdminController();
