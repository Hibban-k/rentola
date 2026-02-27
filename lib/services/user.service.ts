import { userRepository } from "../repositories/user.repository";
import { connectToDatabase } from "@/lib/db";
import { SignupPayload } from "@/types";

export class UserService {
    async register(payload: SignupPayload) {
        await connectToDatabase();
        const { name, email, password, role, licenseImageUrl, documents } = payload;

        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw { status: 400, message: "User already exists with this email" };
        }

        return userRepository.create({
            name,
            email,
            password,
            role: role || "user",
            licenseImageUrl,
            documents
        });
    }

    async getUserById(id: string) {
        await connectToDatabase();
        const user = await userRepository.findById(id);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        return user;
    }

    async getAllUsers() {
        await connectToDatabase();
        return userRepository.findAll();
    }

    async updateUserProviderStatus(userId: string, status: 'approved' | 'rejected') {
        await connectToDatabase();
        return userRepository.update(userId, { providerStatus: status });
    }
}

export const userService = new UserService();
