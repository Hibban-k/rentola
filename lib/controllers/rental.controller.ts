import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, getProviderSession, getAdminSession } from "@/lib/auth";
import { rentalService } from "../services/rental.service";

export class RentalController {
    /**
     * Handle GET /api/users/rentals
     */
    async getUserRentals(request: NextRequest) {
        try {
            const user = await getAuthSession();
            if (!user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const rentals = await rentalService.getUserRentals(user.id!);
            return NextResponse.json({ rentals }, { status: 200 });
        } catch (error: any) {
            console.error("[RentalController.getUserRentals]", error);
            return NextResponse.json(
                { error: error.message || "Internal Server Error" },
                { status: error.status || 500 }
            );
        }
    }

    /**
     * Handle GET /api/provider/rentals
     */
    async getProviderRentals(request: NextRequest) {
        try {
            const user = await getProviderSession();
            // getProviderSession throws error if not authorized/approved

            const rentals = await rentalService.getProviderRentals(user.id!);
            return NextResponse.json(rentals, { status: 200 });
        } catch (error: any) {
            console.error("[RentalController.getProviderRentals]", error);
            const status = error.message === "Unauthorized" || error.message === "Not a provider" || error.message === "Provider not approved" ? 401 : (error.status || 500);
            return NextResponse.json(
                { error: error.message || "Internal Server Error" },
                { status }
            );
        }
    }

    /**
     * Handle POST /api/users/rentals
     */
    async createRental(request: NextRequest) {
        try {
            const user = await getAuthSession();
            if (!user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const body = await request.json();
            const { vehicleId, startDate, endDate } = body;

            if (!vehicleId || !startDate || !endDate) {
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            }

            const rental = await rentalService.createRental(user.id!, {
                vehicleId,
                startDate,
                endDate,
            });

            return NextResponse.json(
                { success: true, message: "Rental created successfully", rental },
                { status: 201 }
            );
        } catch (error: any) {
            console.error("[RentalController.createRental]", error);
            return NextResponse.json(
                { error: error.message || "Internal Server Error" },
                { status: error.status || 500 }
            );
        }
    }

    /**
     * Handle GET /api/admin/rentals/[id]
     */
    async getRentalById(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
        try {
            await getAdminSession();
            const { id } = await params;
            const rental = await rentalService.getRentalById(id);
            return NextResponse.json({ rental }, { status: 200 });
        } catch (error: any) {
            console.error("[RentalController.getRentalById]", error);
            return NextResponse.json(
                { error: error.message || "Internal Server Error" },
                { status: error.status || 500 }
            );
        }
    }

    /**
     * Handle POST /api/cron/complete-rentals
     */
    async completeExpiredRentals(request: NextRequest) {
        try {
            const result = await rentalService.completeExpiredRentals();
            return NextResponse.json(result, { status: 200 });
        } catch (error: any) {
            console.error("[RentalController.completeExpiredRentals]", error);
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }
    }
}

export const rentalController = new RentalController();
