import { paymentController } from "@/lib/controllers/payment.controller";

export async function POST(req: any) {
    return paymentController.handleWebhook(req);
}
