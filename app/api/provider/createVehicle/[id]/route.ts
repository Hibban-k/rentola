import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getProviderSession } from "@/lib/auth";
import Vehicle from "@/models/Vehicle";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const provider = await getProviderSession();

        await connectToDatabase();
        const { id } = await params;
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }
        if (vehicle.ownerId.toString() !== provider.id) {
            return NextResponse.json({ error: "You are not authorized to update this vehicle" }, { status: 403 });
        }
        const body = await request.json();
        const { name, type, licensePlate, pricePerDay, vehicleImageUrl } = body;
        await Vehicle.findByIdAndUpdate(id, {
            name,
            type,
            licensePlate,
            pricePerDay,
            vehicleImageUrl,
        });
        return NextResponse.json({ success: true, message: "Vehicle updated successfully" }, { status: 200 });

    } catch (error) {
        console.log(error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        const status = message === "Unauthorized" || message === "Not a provider" || message === "Provider not approved" ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const provider = await getProviderSession();

        await connectToDatabase();
        const { id } = await params;
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }
        if (vehicle.ownerId.toString() !== provider.id) {
            return NextResponse.json({ error: "You are not authorized to delete this vehicle" }, { status: 403 });
        }
        await vehicle.deleteOne();
        return NextResponse.json({ success: true, message: "Vehicle deleted successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        const status = message === "Unauthorized" || message === "Not a provider" || message === "Provider not approved" ? 401 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}