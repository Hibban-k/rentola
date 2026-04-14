import { NextRequest } from "next/server";
import { adminController } from "@/lib/controllers/admin.controller";

export async function GET(request: NextRequest) {
    return adminController.getProviders(request);
}


