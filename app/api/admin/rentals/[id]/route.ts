import { NextRequest } from "next/server";
import { rentalController } from "@/lib/controllers/rental.controller";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return rentalController.getRentalById(request, { params });
}
