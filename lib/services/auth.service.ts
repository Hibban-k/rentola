import { userRepository } from "../repositories/user.repository";
import { otpRepository } from "../repositories/otp.repository";
import { emailService } from "./email.service";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";

export class AuthService {
    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async requestVerification(email: string) {
        await connectToDatabase();
        const user = await userRepository.findByEmail(email);
        if (!user) throw { status: 404, message: "User not found" };
        if (user.isVerified) throw { status: 400, message: "User already verified" };

        const otp = this.generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await otpRepository.deleteByUserId(user._id.toString(), 'verification');
        await otpRepository.create({
            userId: user._id as any,
            email,
            otp: hashedOtp,
            type: 'verification',
            expiresAt
        });

        await emailService.sendVerificationEmail(email, otp);
        return { message: "Verification OTP sent to your email" };
    }

    async verifyEmail(email: string, otp: string) {
        await connectToDatabase();
        const otpRecord = await otpRepository.findValidOTP(email, 'verification');
        
        if (!otpRecord) throw { status: 400, message: "Invalid or expired OTP" };
        
        if (otpRecord.attempts >= 3) {
            await otpRepository.deleteById(otpRecord._id.toString());
            throw { status: 400, message: "Too many failed attempts. Please request a new OTP." };
        }

        const isValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isValid) {
            await otpRepository.incrementAttempts(otpRecord._id.toString());
            throw { status: 400, message: "Invalid OTP" };
        }

        const user = await userRepository.findByEmail(email);
        if (!user) throw { status: 404, message: "User not found" };

        await userRepository.update(user._id.toString(), { isVerified: true });
        await otpRepository.deleteById(otpRecord._id.toString());

        return { message: "Email verified successfully" };
    }

    async forgotPassword(email: string) {
        await connectToDatabase();
        const user = await userRepository.findByEmail(email);
        if (!user) throw { status: 404, message: "User not found" };

        const otp = this.generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await otpRepository.deleteByUserId(user._id.toString(), 'reset');
        await otpRepository.create({
            userId: user._id as any,
            email,
            otp: hashedOtp,
            type: 'reset',
            expiresAt
        });

        await emailService.sendPasswordResetEmail(email, otp);
        return { message: "Password reset OTP sent to your email" };
    }

    async verifyResetOtp(email: string, otp: string) {
        await connectToDatabase();
        const otpRecord = await otpRepository.findValidOTP(email, 'reset');
        
        if (!otpRecord) throw { status: 400, message: "Invalid or expired OTP" };

        const isValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isValid) {
            await otpRepository.incrementAttempts(otpRecord._id.toString());
            throw { status: 400, message: "Invalid OTP" };
        }

        // Generate a temporary reset token to allow password change
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);

        await userRepository.update(otpRecord.userId.toString(), { passwordResetToken: hashedToken });
        await otpRepository.deleteById(otpRecord._id.toString());

        return { resetToken, message: "OTP verified. You can now reset your password." };
    }

    async resetPassword(email: string, token: string, newPassword: string) {
        await connectToDatabase();
        const user = await userRepository.findByEmail(email);
        if (!user || !user.passwordResetToken) throw { status: 400, message: "Invalid reset request" };

        const isValidToken = await bcrypt.compare(token, user.passwordResetToken);
        if (!isValidToken) throw { status: 400, message: "Invalid or expired reset token" };

        // Updating user with new password and clearing the reset token
        // The password will be hashed by the User model's pre-save hook
        user.password = newPassword;
        user.passwordResetToken = undefined;
        await user.save();

        return { message: "Password reset successfully" };
    }
}

export const authService = new AuthService();
