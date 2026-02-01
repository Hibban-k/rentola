import { NextRequest, NextResponse } from "next/server";

// JWT signout is handled client-side by deleting the token
// This endpoint exists for API consistency and can be extended
// to handle server-side cleanup (e.g., token blacklist) if needed
export async function POST(request: NextRequest) {
    return NextResponse.json({ success: true });
}
