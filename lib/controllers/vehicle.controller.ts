import { NextRequest, NextResponse } from "next/server";
import { vehicleService } from "../services/vehicle.service";
import { getAuthSession, getProviderSession } from "@/lib/auth";

export class VehicleController {
    /**
     * Handle GET /api/vehicles
     */
    async getAllVehicles(request: NextRequest) {
        try {
            const { searchParams } = new URL(request.url);
            const type = searchParams.get("type") as any;
            const search = searchParams.get("search") || undefined;

            const vehicles = await vehicleService.getAllVehicles({ type, search });
            return NextResponse.json({ vehicles }, { status: 200 });
        } catch (error: any) {
            console.error("[VehicleController.getAllVehicles]", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }

    /**
     * Handle GET /api/vehicles/[id]
     */
    async getVehicleById(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
        try {
            const { id } = await params;
            const vehicle = await vehicleService.getVehicleById(id);
            return NextResponse.json({ vehicle }, { status: 200 });
        } catch (error: any) {
            console.error("[VehicleController.getVehicleById]", error);
            return NextResponse.json(
                { error: error.message || "Internal Server Error" },
                { status: error.status || 500 }
            );
        }
    }

    /**
     * Handle GET /api/provider/vehicles
     */
    async getProviderVehicles(request: NextRequest) {
        try {
            const user = await getProviderSession();
            const vehicles = await vehicleService.getProviderVehicles(user.id!);
            return NextResponse.json({ vehicles }, { status: 200 });
        } catch (error: any) {
            console.error("[VehicleController.getProviderVehicles]", error);
            return NextResponse.json(
                { error: error.message || "Unauthorized" },
                { status: error.status || 401 }
            );
        }
    }

    /**
     * Handle POST /api/provider/createVehicle
     */
    async createVehicle(request: NextRequest) {
        try {
            const user = await getProviderSession();
            const body = await request.json();
            const vehicle = await vehicleService.createVehicle(user.id!, body);
            return NextResponse.json({ success: true, vehicle }, { status: 201 });
        } catch (error: any) {
            console.error("[VehicleController.createVehicle]", error);
            return NextResponse.json(
                { error: error.message || "Internal Server Error" },
                { status: error.status || 500 }
            );
        }
    }

    /**
     * Handle PATCH /api/provider/vehicles/[id]
     */
    async updateVehicle(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
        try {
            const user = await getProviderSession();
            const { id } = await params;
            const body = await request.json();
            const vehicle = await vehicleService.updateVehicle(id, user.id!, body);
            return NextResponse.json({ success: true, vehicle }, { status: 200 });
        } catch (error: any) {
            console.error("[VehicleController.updateVehicle]", error);
            return NextResponse.json(
                { error: error.message || "Internal Server Error" },
                { status: error.status || 500 }
            );
        }
    }

    /**
     * Handle DELETE /api/provider/vehicles/[id]
     */
    async deleteVehicle(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
        try {
            const user = await getProviderSession();
            const { id } = await params;
            await vehicleService.deleteVehicle(id, user.id!);
            return NextResponse.json({ success: true, message: "Vehicle deleted" }, { status: 200 });
        } catch (error: any) {
            console.error("[VehicleController.deleteVehicle]", error);
            return NextResponse.json(
                { error: error.message || "Internal Server Error" },
                { status: error.status || 500 }
            );
        }
    }
}

export const vehicleController = new VehicleController();
