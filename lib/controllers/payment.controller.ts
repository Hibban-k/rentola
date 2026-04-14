import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "../services/payment.service";

export class PaymentController {
    /**
     * Handle POST /api/razorpay/webhook
     */
    async handleWebhook(request: NextRequest) {
        try {
            const bodyText = await request.text();
            const signature = request.headers.get("x-razorpay-signature");

            if (!signature) {
                return NextResponse.json({ error: "Missing signature" }, { status: 400 });
            }

            const result = await paymentService.handleWebhook(bodyText, signature);
            return NextResponse.json(result, { status: 200 });
        } catch (error: any) {
            console.error("[PaymentController.handleWebhook]", error);
            
            // For webhooks, we usually return 200/400 even on some errors 
            // to stop Razorpay from retrying endlessly if the error is terminal
            const status = error.message === "Invalid signature" ? 400 : 500;
            return NextResponse.json(
                { error: error.message || "Internal Server Error" },
                { status }
            );
        }
    }
}

export const paymentController = new PaymentController();
