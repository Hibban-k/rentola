import { NextRequest } from "next/server";
import { vehicleController } from "@/lib/controllers/vehicle.controller";

export async function POST(request: NextRequest) {
    return vehicleController.createVehicle(request);
}