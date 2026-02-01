import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { getAdminUser } from "@/lib/auth";

// GET /api/admin/providers - Get all providers for approval management
export async function GET(request: NextRequest) {
    try {
        getAdminUser(request);

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status"); // 'pending', 'approved', 'rejected'

        const query: Record<string, unknown> = { role: "provider" };

        if (status && ["pending", "approved", "rejected"].includes(status)) {
            query.providerStatus = status;
        }

        const providers = await User.find(query)
            .select("_id name email providerStatus createdAt documents")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ providers });
    } catch (error) {
        console.error("Error fetching providers:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
