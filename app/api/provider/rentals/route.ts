import { NextRequest, NextResponse } from "next/server";
import { getProviderSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Rental from "@/models/Rental";
import Vehicle from "@/models/Vehicle";

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const user = await getProviderSession();

        const vehicles = await Vehicle.find({ ownerId: user.id });

        if (vehicles.length === 0) {
            return NextResponse.json({ error: "No vehicles found" }, { status: 404 });
        }

        const rentals = await Rental.find({
            vehicleId: { $in: vehicles.map(v => v._id) }
        }).populate("vehicleId");

        if (rentals.length === 0) {
            return NextResponse.json({ error: "No rentals found" }, { status: 404 });
        }

        return NextResponse.json(rentals);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        const status = message === "Unauthorized" || message === "Not a provider" || message === "Provider not approved" ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}