import { NextRequest, NextResponse } from "next/server";
import { getProviderSession } from "@/lib/auth";
import Rental from "@/models/Rental";
import { connectToDatabase } from "@/lib/db";
import { IVehicle } from "@/models/Vehicle";
import { isVehicleOwner } from "@/lib/rentalRules/permissions";
import { canChangeRentalStatus } from "@/lib/rentalRules/lifecycle";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDatabase();

        const user = await getProviderSession();

        const { status } = await request.json();
        const rental = await Rental.findById(id).populate("vehicleId");

        if (!rental) {
            return NextResponse.json({ error: "Rental not found" }, { status: 404 });
        }

        // Check vehicle ownership
        const vehicle = rental.vehicleId as unknown as IVehicle;
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }
        const isOwner = await isVehicleOwner(vehicle._id.toString(), user.id!);
        if (!isOwner) {
            return NextResponse.json({ error: "Forbidden: Ownership mismatch" }, { status: 403 });
        }

        // Check state rules
        const validTransitions = canChangeRentalStatus(rental.status, status);
        if (!validTransitions) {
            return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
        }

        // Update the state of rental
        rental.status = status;
        await rental.save();

        return NextResponse.json(rental);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        const status = message === "Unauthorized" || message === "Not a provider" || message === "Provider not approved" ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
