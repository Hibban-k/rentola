import { NextRequest, NextResponse } from "next/server";
import { userService } from "../services/user.service";
import { getAdminSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { userRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class UserController {
    /**
     * Handle POST /api/auth/signup
     */
    async signup(request: NextRequest) {
        try {
            const body = await request.json();
            const user = await userService.register(body);

            // Generate JWT token for signup response
            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    providerStatus: user.providerStatus
                },
                process.env.JWT_SECRET || "default_secret",
                { expiresIn: "7d" }
            );

            return NextResponse.json(
                {
                    message: "User registered successfully",
                    userId: user._id,
                    token: token,
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
     * Handle POST /api/auth/signin (Manual token for localStorage)
     */
    async signin(request: NextRequest) {
        try {
            const { email, password } = await request.json();
            await connectToDatabase();

            const user = await userRepository.findByEmail(email);
            if (!user) {
                return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
            }

            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    providerStatus: user.providerStatus
                },
                process.env.JWT_SECRET || "default_secret",
                { expiresIn: "7d" }
            );

            return NextResponse.json({
                message: "Logged in successfully",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    providerStatus: user.providerStatus
                }
            });
        } catch (error: any) {
            console.error("[UserController.signin]", error);
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
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
