import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { getAdminSession } from "@/lib/auth";

// GET /api/admin/providers/[id] - Get a single provider
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await getAdminSession();
        const { id } = await params;

        await connectToDatabase();

        const provider = await User.findOne({ _id: id, role: "provider" })
            .select("-password");

        if (!provider) {
            return NextResponse.json({ error: "Provider not found" }, { status: 404 });
        }

        return NextResponse.json(provider);
    } catch (error) {
        console.error("Error fetching provider:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        const status = message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}

// PATCH /api/admin/providers/[id] - Approve or reject a provider
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await getAdminSession();
        const { id } = await params;

        await connectToDatabase();

        const body = await request.json();
        const { providerStatus } = body;

        if (!providerStatus || !["approved", "rejected"].includes(providerStatus)) {
            return NextResponse.json(
                { error: "Invalid status. Must be 'approved' or 'rejected'" },
                { status: 400 }
            );
        }

        const user = await User.findOneAndUpdate(
            { _id: id, role: "provider" },
            { providerStatus },
            { new: true }
        ).select("_id name email providerStatus");

        if (!user) {
            return NextResponse.json({ error: "Provider not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Error updating provider status:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        const status = message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
