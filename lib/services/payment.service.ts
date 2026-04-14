import crypto from "crypto";
import mongoose from "mongoose";
import { paymentRepository } from "../repositories/payment.repository";
import { rentalRepository } from "../repositories/rental.repository";
import { connectToDatabase } from "../db";

export class PaymentService {
    /**
     * Verify a Razorpay Webhook signature and process the order
     */
    async handleWebhook(bodyText: string, signature: string) {
        await connectToDatabase();
        
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
        
        // 1. Verify Signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(bodyText)
            .digest("hex");

        if (expectedSignature !== signature) {
            throw new Error("Invalid signature");
        }

        const payload = JSON.parse(bodyText);

        // 2. We only process 'order.paid' to finalize bookings
        if (payload.event === "order.paid") {
            const orderEntity = payload.payload.order.entity;
            const razorpayOrderId = orderEntity.id;
            const rentalId = orderEntity.receipt; // We store Rental ID in receipt

            const session = await mongoose.startSession();
            
            try {
                await session.withTransaction(async () => {
                    // 3. Update Rental status to active
                    const rental = await rentalRepository.findById(rentalId);
                    if (!rental) throw new Error("Rental not found");

                    if (rental.status === "active") return; // Idempotency check

                    await rentalRepository.updateStatus(rentalId, "active", session);

                    // 4. Record the Payment in our DB
                    // Note: We'll update the payment record if it exists or create one
                    await paymentRepository.updateStatus(
                        razorpayOrderId,
                        "success",
                        {
                            rentalId: new mongoose.Types.ObjectId(rentalId),
                            renterId: rental.renterId,
                            amount: orderEntity.amount / 100, // back to INR
                            razorpayPaymentId: payload.payload.payment?.entity?.id
                        },
                        session
                    );
                });
            } finally {
                await session.endSession();
            }
        }

        return { success: true };
    }

    /**
     * Create an initial payment record when an order is created
     */
    async initializePayment(data: {
        rentalId: string;
        renterId: string;
        amount: number;
        razorpayOrderId: string;
    }) {
        await connectToDatabase();
        return paymentRepository.create({
            rentalId: new mongoose.Types.ObjectId(data.rentalId),
            renterId: new mongoose.Types.ObjectId(data.renterId),
            amount: data.amount,
            razorpayOrderId: data.razorpayOrderId,
            status: 'pending'
        });
    }
}

export const paymentService = new PaymentService();
