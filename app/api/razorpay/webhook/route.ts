import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rentalRepository } from "@/lib/repositories/rental.repository";
import { connectToDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

        // Cryptographically verify the webhook authenticity
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(bodyText)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error("[Razorpay Webhook] Invalid signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const payload = JSON.parse(bodyText);

        // We only care about the order.paid event for confirming rentals
        if (payload.event === "order.paid") {
            const orderEntity = payload.payload.order.entity;
            const rentalId = orderEntity.receipt; // We attached the Rental ID here during creation

            if (!rentalId) {
                console.error("[Razorpay Webhook] No receipt/rentalId found in order");
                return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
            }

            await connectToDatabase();
            
            // Apply Idempotency & finalize payment
            const rental = await rentalRepository.findById(rentalId);
            if (!rental) {
                return NextResponse.json({ error: "Rental not found" }, { status: 404 });
            }

            if (rental.status === "active" || rental.status === "completed") {
                // Idempotency: Webhook fired twice, but we already processed it
                return NextResponse.json({ success: true, message: "Already processed" }, { status: 200 });
            }

            // Upgrade status to active formally granting the reservation
            await rentalRepository.updateStatus(rentalId, "active");
            
            // (Optional) Trigger Email/Notification services here via Pusher/Resend
            
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // Acknowledge other events gracefully
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[Razorpay Webhook Error]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
