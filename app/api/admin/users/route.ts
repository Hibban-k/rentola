import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        await getAdminSession();

        await connectToDatabase();

        const users = await User.find({}).select("-password").sort({ createdAt: -1 });

        return NextResponse.json({ users }, { status: 200 });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        const status = message === "Unauthorized" ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
