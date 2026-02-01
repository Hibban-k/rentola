import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getProviderUser} from "@/lib/auth";
import Vehicle from "@/models/Vehicle";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
       let provider;
       let admin;
        try {
            provider = getProviderUser(request);
            
        }catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }   
        await connectToDatabase();
        const { id } = await params;
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }
        if (vehicle.ownerId.toString() !== provider.userId) {
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
        })
        return NextResponse.json({ success: true, message: "Vehicle updated successfully" }, { status: 200 });






    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        let provider;
        try {
            provider = getProviderUser(request);
        } catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 401 });
        }   
        await connectToDatabase();
        const { id } = await params;
        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }
        if (vehicle.ownerId.toString() !== provider.userId) {
            return NextResponse.json({ error: "You are not authorized to delete this vehicle" }, { status: 403 });
        }
        await vehicle.deleteOne();
        return NextResponse.json({ success: true, message: "Vehicle deleted successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}