import { NextRequest } from "next/server";
import { vehicleController } from "@/lib/controllers/vehicle.controller";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return vehicleController.getVehicleById(request, { params });
}
