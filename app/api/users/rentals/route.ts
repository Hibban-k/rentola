import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Rental from "@/models/Rental";
import { getAuthUser } from "@/lib/auth";
import { getVehicleWithOwnership } from "@/lib/ownership";
import { canCreateRental } from "@/lib/stateRules";

export async function POST(request: NextRequest) {
    try {
        const user = getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectToDatabase();
        const body = await request.json();
        const { vehicleId, startDate, endDate, pickupLocation, dropOffLocation } = body;
        if (!vehicleId || !startDate || !endDate || !pickupLocation || !dropOffLocation) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const { vehicle, isOwner } = await getVehicleWithOwnership(vehicleId, user.userId);
        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }
        const rentalCheck = canCreateRental(isOwner);
        if (!rentalCheck.allowed) {
            return NextResponse.json({ error: rentalCheck.reason }, { status: 400 });
        }

        if (!vehicle.isAvailable) {
            return NextResponse.json({ error: "Vehicle is currently unavailable for rent" }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const existingRental = await Rental.findOne({
            vehicleId: vehicleId,
            status: { $ne: 'cancelled' },
            "rentalPeriod.startDate": { $lt: end },
            "rentalPeriod.endDate": { $gt: start }
        });

        if (existingRental) {
            return NextResponse.json({ error: "Vehicle is already booked for these dates" }, { status: 409 });
        }

        const rental = await Rental.create({
            vehicleId: vehicleId,
            renterId: user.userId,
            pickupLocation,
            dropOffLocation,
            rentalPeriod: {
                startDate: start,
                endDate: end,
            },
        });
        return NextResponse.json({ success: true, message: "Rental created successfully" }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectToDatabase();
        const rentals = await Rental.find({ renterId: user.userId })
            .populate("vehicleId", "name type pricePerDay vehicleImageUrl")
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json({ rentals }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

