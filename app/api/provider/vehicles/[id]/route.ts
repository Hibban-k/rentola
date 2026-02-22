import { NextRequest } from "next/server";
import { vehicleController } from "@/lib/controllers/vehicle.controller";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return vehicleController.updateVehicle(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return vehicleController.deleteVehicle(request, { params });
}
