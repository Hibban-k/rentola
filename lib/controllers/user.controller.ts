import { NextRequest, NextResponse } from "next/server";
import { userService } from "../services/user.service";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { userRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";

export class UserController {
    /**
     * Handle POST /api/auth/signup
     */
    async signup(request: NextRequest) {
        try {
            const body = await request.json();
            const user = await userService.register(body);

            return NextResponse.json(
                {
                    message: "User registered successfully",
                    userId: user._id,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        providerStatus: user.providerStatus
                    }
                },
                { status: 201 }
            );
        } catch (error: any) {
            console.error("[UserController.signup]", error);
            return NextResponse.json(
                { error: error.message || "Internal Server Error" },
                { status: error.status || 500 }
            );
        }
    }

    /**
     * Handle GET /api/admin/users
     */
    async getUsers(request: NextRequest) {
        try {
            await getAdminSession();
            const users = await userService.getAllUsers();
            return NextResponse.json({ users }, { status: 200 });
        } catch (error: any) {
            console.error("[UserController.getUsers]", error);
            return NextResponse.json(
                { error: error.message || "Unauthorized" },
                { status: error.status || 401 }
            );
        }
    }
}

export const userController = new UserController();
