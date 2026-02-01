import { NextRequest, NextResponse } from "next/server";
import { getProviderUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Rental from "@/models/Rental";
import Vehicle from "@/models/Vehicle";

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        let user;
        try {
            user = getProviderUser(request);
        } catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }

        const vehicles = await Vehicle.find({ ownerId: user.userId });

        if (vehicles.length === 0) {
            return NextResponse.json({ error: "No vehicles found" }, { status: 404 });
        }

        const rentals = await Rental.find({
            vehicleId: { $in: vehicles.map(v => v._id) }
        });

        if (rentals.length === 0) {
            return NextResponse.json({ error: "No rentals found" }, { status: 404 });
        }

        return NextResponse.json(rentals);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}