import { NextRequest, NextResponse } from "next/server";
import { userService } from "../services/user.service";
import { getAdminSession } from "@/lib/auth";

export class UserController {
    /**
     * Handle POST /api/auth/signup
     */
    async signup(request: NextRequest) {
        try {
            const body = await request.json();
            const user = await userService.register(body);
            return NextResponse.json(
                { message: "User registered successfully", userId: user._id },
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
