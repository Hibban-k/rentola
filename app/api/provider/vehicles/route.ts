import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import { getProviderUser } from "@/lib/auth";

// GET /api/provider/vehicles - Get provider's vehicles
export async function GET(request: NextRequest) {
    try {
        const provider = getProviderUser(request);

        await connectToDatabase();

        const vehicles = await Vehicle.find({ ownerId: provider.userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ vehicles });
    } catch (error) {
        console.error("Error fetching provider vehicles:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
