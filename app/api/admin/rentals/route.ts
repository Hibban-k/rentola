import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Rental from "@/models/Rental";
import { getAdminSession } from "@/lib/auth";

// GET /api/admin/rentals - Get all rentals for admin
export async function GET(request: NextRequest) {
    try {
        await getAdminSession();

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status"); // 'pending', 'approved', 'rejected'

        const query: Record<string, unknown> = {};

        if (status && ["pending", "approved", "rejected"].includes(status)) {
            query.status = status;
        }

        const rentals = await Rental.find(query)
            .populate("vehicleId", "name vehicleImageUrl pricePerDay type")
            .populate("renterId", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ rentals });
    } catch (error) {
        console.error("Error fetching rentals:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        const status = message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
