import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import User from "@/models/User";

// GET /api/vehicles/[id] - Get single vehicle details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;

        const vehicle = await Vehicle.findById(id).lean();

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        // Get owner info (limited fields for privacy)
        const owner = await User.findById(vehicle.ownerId).select("name").lean();

        return NextResponse.json({
            vehicle: {
                ...vehicle,
                owner: owner ? { name: owner.name } : null,
            },
        });
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
    }
}
