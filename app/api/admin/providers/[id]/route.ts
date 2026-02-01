import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { getAdminUser } from "@/lib/auth";

// PATCH /api/admin/providers/[id] - Approve or reject a provider
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        getAdminUser(request);
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
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
