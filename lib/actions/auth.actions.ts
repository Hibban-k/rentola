"use server";

import { userService } from "@/lib/services/user.service";
import { authService } from "@/lib/services/auth.service";
import { SignupPayload } from "@/types";

export async function signupAction(payload: SignupPayload) {
    try {
        const user = await userService.register(payload);
        
        // Trigger verification email
        await authService.requestVerification(user.email);

        return { 
            success: true, 
            data: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                providerStatus: user.providerStatus,
            },
            message: "Account created. Please verify your email."
        };
    } catch (error: any) {
        console.error("[signupAction]", error);
        return { 
            success: false, 
            error: error.message || "Failed to create account" 
        };
    }
}

export async function verifyEmailAction(email: string, otp: string) {
    try {
        const result = await authService.verifyEmail(email, otp);
        return { success: true, message: result.message };
    } catch (error: any) {
        return { success: false, error: error.message || "Verification failed" };
    }
}

export async function resendOtpAction(email: string) {
    try {
        const result = await authService.requestVerification(email);
        return { success: true, message: result.message };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to send OTP" };
    }
}

export async function forgotPasswordAction(email: string) {
    try {
        const result = await authService.forgotPassword(email);
        return { success: true, message: result.message };
    } catch (error: any) {
        return { success: false, error: error.message || "Request failed" };
    }
}

export async function verifyResetOtpAction(email: string, otp: string) {
    try {
        const result = await authService.verifyResetOtp(email, otp);
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message || "OTP verification failed" };
    }
}

export async function resetPasswordAction(email: string, token: string, password: string) {
    try {
        const result = await authService.resetPassword(email, token, password);
        return { success: true, message: result.message };
    } catch (error: any) {
        return { success: false, error: error.message || "Password reset failed" };
    }
}
