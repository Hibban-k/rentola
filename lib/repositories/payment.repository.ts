import Payment, { IPayment } from "@/models/Payment";
import { ClientSession } from "mongoose";

export class PaymentRepository {
    async create(data: Partial<IPayment>, session?: ClientSession): Promise<IPayment> {
        const payment = new Payment(data);
        return payment.save({ session });
    }

    async findByOrderId(orderId: string): Promise<IPayment | null> {
        return Payment.findOne({ razorpayOrderId: orderId });
    }

    async updateStatus(
        orderId: string, 
        status: IPayment['status'], 
        additionalData: Partial<IPayment> = {},
        session?: ClientSession
    ): Promise<IPayment | null> {
        return Payment.findOneAndUpdate(
            { razorpayOrderId: orderId },
            { $set: { status, ...additionalData } },
            { new: true, session }
        );
    }
}

export const paymentRepository = new PaymentRepository();
