import { userRepository } from "../repositories/user.repository";
import { connectToDatabase } from "@/lib/db";

export class AdminService {
    async approveProvider(userId: string) {
        await connectToDatabase();
        const user = await userRepository.findById(userId);
        if (!user || user.role !== "provider") {
            throw { status: 404, message: "User not found" };
        }
        return userRepository.update(userId, { providerStatus: "approved" });
    }

    async rejectProvider(userId: string) {
        await connectToDatabase();
        const user = await userRepository.findById(userId);
        if (!user || user.role !== "provider") {
            throw { status: 404, message: "User not found" };
        }
        return userRepository.update(userId, { providerStatus: "rejected" });
    }

    async getAllProviders() {
        await connectToDatabase();
        return userRepository.findByRole("provider");
    }

    async getProviderById(userId: string) {
        await connectToDatabase();
        return userRepository.findById(userId);
    }

}

export const adminService = new AdminService();
