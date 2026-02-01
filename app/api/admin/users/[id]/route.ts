import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import User from "@/models/User";
import { canChangeProviderStatus } from "@/lib/stateRules";
import { connectToDatabase } from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        let admin;
        try {
            admin = getAdminUser(request);
        } catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }
        await connectToDatabase();
        const { id } = await params;
        const user = await User.findById(id);
        if (!user || user.role !== "provider")
            return NextResponse.json({ error: "invalid user" }, { status: 404 });

        const { status } = await request.json();
        if (!status) {
            return NextResponse.json(
                { error: "Status is required" },
                { status: 400 }
            );
        }

        const validTransitions = canChangeProviderStatus(user.providerStatus, status);
        if (!validTransitions) {
            return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
        }
        user.providerStatus = status;
        await user.save();
        return NextResponse.json({
            success: true,
            message: "User status updated successfully",
            user: {
                id: user._id,
                role: user.role,
                providerStatus: user.providerStatus
            }
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}