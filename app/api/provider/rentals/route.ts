import { NextRequest } from "next/server";
import { rentalController } from "@/lib/controllers/rental.controller";

export async function GET(request: NextRequest) {
    return rentalController.getProviderRentals(request);
}