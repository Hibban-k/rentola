import { NextRequest } from "next/server";
import { adminController } from "@/lib/controllers/admin.controller";

export async function GET(request: NextRequest) {
    return adminController.getProviders(request);
}

export async function POST(request: NextRequest) {
    return adminController.handleProviderStatus(request);
}
