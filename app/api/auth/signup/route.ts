import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { IUser } from "@/models/User";

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(request: NextRequest) {
    try {
        // Connect to database
        await connectToDatabase();

        // Parse request body
        const body = await request.json();
        const { name, email, password, imageUrl, documents, role } = body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { success: false, message: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Invalid email format" },
                { status: 400 }
            );
        }

        // Check if password meets minimum requirements
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, message: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        // Check if user already exists
        // console.log("Checking for email:");
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        const existedAdmin = await User.findOne({ role: "admin" });
        // console.log("Existing user found:", existingUser ? "YES" : "NO");
        if (role === "provider" && !documents) {
            return NextResponse.json(
                { success: false, message: "Documents are required for providers" },
                { status: 409 }
            );
        }

        if (existingUser) {
            // console.log("Existing user email:", existingUser.email);
            return NextResponse.json(
                { success: false, message: "User with this email already exists" },
                { status: 409 }
            );
        }

        if (role === "admin" && existedAdmin) {
            return NextResponse.json(
                { success: false, message: "Admin already exists" },
                { status: 409 }
            );
        }

        // Create new user (password will be hashed by the pre-save hook in User model)
        const newUser: IUser = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role,
            providerStatus: "pending",
            imageUrl,
            documents,
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: newUser._id.toString(),
                // email: newUser.email,
                role: newUser.role,
                providerStatus: newUser.providerStatus,

            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Return success response (exclude password from response)
        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    providerStatus: newUser.providerStatus,
                    createdAt: newUser.createdAt,
                },
                token,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error("Signup error:", error);

        // Handle MongoDB duplicate key error
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "User with this email already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
