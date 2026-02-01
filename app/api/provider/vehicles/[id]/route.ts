import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import { getProviderUser } from "@/lib/auth";

// PATCH /api/provider/vehicles/[id] - Update vehicle (availability, etc.)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const provider = getProviderUser(request);
        const { id } = await params;

        await connectToDatabase();

        const vehicle = await Vehicle.findOne({ _id: id, ownerId: provider.userId });

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        const body = await request.json();
        const allowedUpdates = ["isAvailable", "name", "pricePerDay", "vehicleImageUrl"];

        for (const key of Object.keys(body)) {
            if (allowedUpdates.includes(key)) {
                (vehicle as Record<string, unknown>)[key] = body[key];
            }
        }

        await vehicle.save();

        return NextResponse.json({ success: true, vehicle });
    } catch (error) {
        console.error("Error updating vehicle:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// GET /api/provider/vehicles/[id] - Get single vehicle
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const provider = getProviderUser(request);
        const { id } = await params;

        await connectToDatabase();

        const vehicle = await Vehicle.findOne({ _id: id, ownerId: provider.userId }).lean();

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        return NextResponse.json({ vehicle });
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
