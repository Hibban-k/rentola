import { paymentController } from "@/lib/controllers/payment.controller";

export async function POST(req: any) {
    console.log("[Webhook Route] POST request received");
    return paymentController.handleWebhook(req);
}
