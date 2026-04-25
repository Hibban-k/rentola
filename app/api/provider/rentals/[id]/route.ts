import { NextRequest } from "next/server";
import { rentalController } from "@/lib/controllers/rental.controller";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return rentalController.updateProviderRentalStatus(request, { params });
}
