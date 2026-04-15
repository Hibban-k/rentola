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

        // 2. We handle 'order.paid' to activate bookings
        if (payload.event === "order.paid") {
            const orderEntity = payload.payload.order.entity;
            const razorpayOrderId = orderEntity.id;
            const rentalId = orderEntity.receipt;

            console.log(`[PaymentService] Processing success for Order: ${razorpayOrderId}, Rental: ${rentalId}`);

            const session = await mongoose.startSession();
            try {
                await session.withTransaction(async () => {
                    const rental = await rentalRepository.findById(rentalId);
                    if (!rental) throw new Error("Rental not found");

                    if (rental.status === "active") {
                        console.log(`[PaymentService] Rental ${rentalId} already active. Skipping.`);
                        return;
                    }

                    await rentalRepository.updateStatus(rentalId, "active", session);

                    await paymentRepository.updateStatus(
                        razorpayOrderId,
                        "success",
                        {
                            rentalId: new mongoose.Types.ObjectId(rentalId),
                            renterId: rental.renterId,
                            amount: Math.round(orderEntity.amount / 100),
                            razorpayPaymentId: payload.payload.payment?.entity?.id
                        },
                        session
                    );
                });
                console.log(`[PaymentService] Successfully recorded SUCCESS for Order: ${razorpayOrderId}`);
            } finally {
                await session.endSession();
            }
        } 
        // 3. Handle Payment Failures
        else if (payload.event === "payment.failed") {
            const paymentEntity = payload.payload.payment.entity;
            const razorpayOrderId = paymentEntity.order_id;
            
            console.warn(`[PaymentService] Payment FAILED for Order: ${razorpayOrderId}. Reason: ${paymentEntity.error_description}`);
            
            await paymentRepository.updateStatus(
                razorpayOrderId,
                "failed",
                {
                    razorpayPaymentId: paymentEntity.id
                }
            );
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
