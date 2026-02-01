import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectToDatabase } from "./db";
import Vehicle from "@/models/Vehicle";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
    userId: string;
    role: "user" | "provider" | "admin";
    providerStatus: "pending" | "approved" | "rejected";
}

export function verifyJWT(token: string): JWTPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}
export function getAuthUser(request: Request): JWTPayload | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split(" ")[1];
    try {
        return verifyJWT(token);
    } catch {
        return null;
    }
}

export function getProviderUser(request: Request): JWTPayload {
    const user = getAuthUser(request);

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Admin has access to all provider routes
    if (user.role === "admin") {
        return user;
    }

    if (user.role !== "provider") {
        throw new Error("Not a provider");
    }

    if (user.providerStatus !== "approved") {
        throw new Error("Provider not approved");
    }

    return user;
}

export function getAdminUser(request: Request): JWTPayload {
    const user = getAuthUser(request);

    if (!user) {
        throw new Error("Unauthorized");
    }

    if (user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    return user;
}