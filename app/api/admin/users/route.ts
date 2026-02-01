import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET(request: NextRequest) {
    try {
        let admin;
        try {
            admin = getAdminUser(request);
        } catch (err:any) {
           
            return NextResponse.json({ error: err.message }, { status: 401 });
        }
        const users = await User.find({role:"user"});
        const providers = await User.find({role:"provider"});

        return NextResponse.json({ users, providers }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
