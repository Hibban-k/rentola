import { NextRequest } from "next/server";
import { vehicleController } from "@/lib/controllers/vehicle.controller";

export async function GET(request: NextRequest) {
    return vehicleController.getProviderVehicles(request);
}
