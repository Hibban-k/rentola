import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Vehicle from "@/models/Vehicle";

// GET /api/vehicles - Public endpoint to list available vehicles
export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type"); // 'car' or 'bike'
        const search = searchParams.get("search");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");

        // Build query
        const query: Record<string, unknown> = { isAvailable: true };

        if (type && ["car", "bike"].includes(type)) {
            query.type = type;
        }

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        if (minPrice) {
            query.pricePerDay = { ...((query.pricePerDay as object) || {}), $gte: Number(minPrice) };
        }

        if (maxPrice) {
            query.pricePerDay = { ...((query.pricePerDay as object) || {}), $lte: Number(maxPrice) };
        }

        const vehicles = await Vehicle.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ vehicles });
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
    }
}
