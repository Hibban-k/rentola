import { NextRequest } from "next/server";
import { adminController } from "@/lib/controllers/admin.controller";

export async function POST(request: NextRequest) {
    return adminController.handleProviderStatus(request);
}
