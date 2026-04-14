"use server";

import { userService } from "@/lib/services/user.service";
import { SignupPayload } from "@/types";

export async function signupAction(payload: SignupPayload) {
    try {
        const user = await userService.register(payload);
        
        // Return a plain object to avoid passing Mongoose documents to the client
        return { 
            success: true, 
            data: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                providerStatus: user.providerStatus,
                documents: user.documents,
                licenseImageUrl: user.licenseImageUrl,
            }
        };
    } catch (error: any) {
        console.error("[signupAction]", error);
        return { 
            success: false, 
            error: error.message || "Failed to create account" 
        };
    }
}
