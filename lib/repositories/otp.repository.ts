import OTP, { IOTP } from "@/models/OTP";
import mongoose from "mongoose";

export class OTPRepository {
    async create(otpData: Partial<IOTP>): Promise<IOTP> {
        return OTP.create(otpData);
    }

    async findValidOTP(email: string, type: 'verification' | 'reset'): Promise<IOTP | null> {
        return OTP.findOne({ 
            email, 
            type, 
            expiresAt: { $gt: new Date() } 
        }).sort({ createdAt: -1 });
    }

    async deleteByUserId(userId: string, type: 'verification' | 'reset'): Promise<void> {
        await OTP.deleteMany({ userId, type });
    }

    async incrementAttempts(otpId: string): Promise<void> {
        await OTP.findByIdAndUpdate(otpId, { $inc: { attempts: 1 } });
    }

    async deleteById(otpId: string): Promise<void> {
        await OTP.findByIdAndDelete(otpId);
    }
}

export const otpRepository = new OTPRepository();
