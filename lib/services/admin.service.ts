import { userRepository } from "../repositories/user.repository";
import { connectToDatabase } from "@/lib/db";

export class AdminService {
    async approveProvider(userId: string) {
        await connectToDatabase();
        return userRepository.update(userId, { providerStatus: "approved", role: "provider" });
    }

    async rejectProvider(userId: string) {
        await connectToDatabase();
        return userRepository.update(userId, { providerStatus: "rejected" });
    }

    async getAllProviders() {
        await connectToDatabase();
        return userRepository.findByRole("provider");
    }
}

export const adminService = new AdminService();
