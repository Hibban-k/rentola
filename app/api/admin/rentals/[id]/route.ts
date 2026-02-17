import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Rental from "@/models/Rental";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await getAdminSession();

        await connectToDatabase();

        const { id } = await params;

        const rental = await Rental.findById(id)
            .populate("vehicleId", "name vehicleImageUrl pricePerDay type")
            .populate("renterId", "name email")
            .lean();

        if (!rental) {
            return NextResponse.json({ error: "Rental not found" }, { status: 404 });
        }

        return NextResponse.json({ rental });
    } catch (error) {
        console.error("Error fetching rental:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        const status = message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
