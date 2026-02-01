import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { IUser } from "@/models/User";
import bcrypt from "bcryptjs";


const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 404 }

            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: "Invalid password or email" },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                // email: user.email,
                role: user.role,
                providerStatus: user.providerStatus,
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        

        return NextResponse.json(
            {
                success: true,
                message: "User signed in successfully",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    providerStatus: user.providerStatus,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error signing in:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}