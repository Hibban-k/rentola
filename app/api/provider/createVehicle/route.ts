import { NextRequest, NextResponse } from "next/server";
import { getProviderUser } from "@/lib/auth";
import Vehicle from "@/models/Vehicle";
import { connectToDatabase } from "@/lib/db";


export async function POST(request: NextRequest) {
    try {
        
        const provider = getProviderUser(request);
        const body = await request.json();
        const {name, type,licensePlate, pricePerDay, vehicleImageUrl } = body;

        if (!name || !type || !licensePlate || !pricePerDay || !vehicleImageUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const vehicle = await Vehicle.create({
            name,
            type,
            licensePlate,
            pricePerDay,
            vehicleImageUrl,
            ownerId: provider.userId,
        }); 
        console.log(provider.userId)
        return NextResponse.json({ success: true, message: "Vehicle created successfully" }, { status: 201 });



    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }}