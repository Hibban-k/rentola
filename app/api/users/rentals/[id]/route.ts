import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Rental from "@/models/Rental";
import { getAuthSession } from "@/lib/auth";
import { canCancelRental, canChangeRentalStatus } from "@/lib/stateRules";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const user = await getAuthSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (user.role !== "user") {
            return NextResponse.json({ error: "You are not authorized to update this rental" }, { status: 403 });
        }

        const { id } = await params;
        const rental = await Rental.findById(id);
        if (!rental) {
            return NextResponse.json({ error: "Rental not found" }, { status: 404 });
        }
        if (rental.renterId.toString() !== user.id) {
            return NextResponse.json({ error: "You are not authorized to update this rental" }, { status: 403 });
        }
        const CancelRental = canCancelRental(user.role!, rental.status);
        if (!CancelRental) {
            return NextResponse.json(
                { error: "You cannot cancel this rental" },
                { status: 403 }
            );
        }
        const body = await request.json();
        const { status } = body;
        const validTransitions = canChangeRentalStatus(rental.status, status);
        if (!validTransitions) {
            return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
        }
        rental.status = status;
        await rental.save();
        return NextResponse.json(rental);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const user = await getAuthSession();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (user.role !== "user") {
            return NextResponse.json({ error: "You are not authorized to update this rental" }, { status: 403 });
        }
        const { id } = await params;
        const rental = await Rental.findById(id);
        if (!rental) {
            return NextResponse.json({ error: "Rental not found" }, { status: 404 });
        }
        if (rental.renterId.toString() !== user.id) {
            return NextResponse.json({ error: "You are not authorized to update this rental" }, { status: 403 });
        }
        return NextResponse.json(rental);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
