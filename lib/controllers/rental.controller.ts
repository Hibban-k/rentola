import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, getProviderSession, getAdminSession } from "@/lib/auth";
import { rentalService } from "../services/rental.service";
import { paymentService } from "../services/payment.service";
import { rentalCreateSchema } from "@/lib/validations/rental.schema";
import { getRazorpay } from "@/lib/razorpay";

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
            
            // Zod Validation securely sanitizes the payload
            const validationResult = rentalCreateSchema.safeParse(body);
            if (!validationResult.success) {
                return NextResponse.json({ 
                    error: "Validation failed", 
                    details: validationResult.error.format() 
                }, { status: 400 });
            }

            const { vehicleId, startDate, endDate } = validationResult.data;
            let createdRentalId: string | null = null;
            try {
                const rental = await rentalService.createRental(user.id!, {
                    vehicleId,
                    startDate,
                    endDate,
                });

                if (!rental) {
                    return NextResponse.json({ error: "Failed to allocate rental" }, { status: 500 });
                }

                createdRentalId = rental._id.toString();

                // Create Razorpay Order asynchronously
                const razorpayOptions = {
                    amount: Math.round(rental.totalCost * 100), // convert INR to paise
                    currency: "INR",
                    receipt: createdRentalId as any
                };
                
                const rzp = getRazorpay();
                const order = await rzp.orders.create(razorpayOptions);

                // Initialize Payment record in our database
                await paymentService.initializePayment({
                    rentalId: rental._id.toString(),
                    renterId: user.id!,
                    amount: rental.totalCost,
                    razorpayOrderId: order.id
                });

                return NextResponse.json(
                    { 
                        success: true, 
                        message: "Rental created successfully", 
                        rental,
                        razorpayOrderId: order.id 
                    },
                    { status: 201 }
                );

            } catch (error: any) {
                // CLEANUP: If we created a rental but something failed after (e.g. Razorpay), delete it.
                if (createdRentalId) {
                    console.warn(`[RentalController.createRental] Cleaning up zombie rental ${createdRentalId} after failure.`);
                    await rentalService.deleteRental(createdRentalId);
                }
                throw error; // Let the outer catch handle response logic
            }

        } catch (error: any) {
            console.error("[RentalController.createRental] Full Error Block:", error);
            
            // Extract the most descriptive message possible
            const displayError = error.description || error.message || "Internal Server Error";
            const errorType = error.code || error.name || "UnknownError";

            return NextResponse.json(
                { 
                    error: displayError,
                    errorType: errorType,
                    details: error.details || null
                },
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
