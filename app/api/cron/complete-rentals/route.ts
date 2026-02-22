import { NextRequest, NextResponse } from "next/server";
import { rentalController } from "@/lib/controllers/rental.controller";

export async function GET(request: NextRequest) {
    return rentalController.completeExpiredRentals(request);
}

export async function POST(request: NextRequest) {
    return rentalController.completeExpiredRentals(request);
}
