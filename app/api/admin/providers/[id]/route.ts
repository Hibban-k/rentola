import { NextRequest, NextResponse } from "next/server";
import { adminController } from "@/lib/controllers/admin.controller";

// GET /api/admin/providers/[id] - Get a single provider
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return adminController.getProviderById(request, id);
}

// PATCH /api/admin/providers/[id] - Approve or reject a provider
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return adminController.handleProviderStatus(request, id);
}
