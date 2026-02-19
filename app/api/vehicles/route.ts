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

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 12;
        const skip = (page - 1) * limit;

        const [vehicles, total] = await Promise.all([
            Vehicle.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Vehicle.countDocuments(query)
        ]);

        return NextResponse.json({
            vehicles,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
    }
}
