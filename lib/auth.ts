import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./authOptions";

export interface SessionUser {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    providerStatus?: string;
}

/**
 * Get the current authenticated session for API routes.
 * Returns the session user or null if not authenticated.
 */
export async function getAuthSession(): Promise<SessionUser | null> {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return null;
    }

    return session.user as SessionUser;
}

/**
 * Get the session and verify the user is a provider with approved status.
 * Throws an error if not authenticated or not an approved provider.
 * Admin users are also allowed.
 */
export async function getProviderSession(): Promise<SessionUser> {
    const user = await getAuthSession();

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

/**
 * Get the session and verify the user is an admin.
 * Throws an error if not authenticated or not an admin.
 */
export async function getAdminSession(): Promise<SessionUser> {
    const user = await getAuthSession();

    if (!user) {
        throw new Error("Unauthorized");
    }

    if (user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    return user;
}

/**
 * Helper to create an unauthorized response for API routes.
 */
export function unauthorizedResponse(message: string = "Unauthorized") {
    return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Helper to create a forbidden response for API routes.
 */
export function forbiddenResponse(message: string = "Forbidden") {
    return NextResponse.json({ error: message }, { status: 403 });
}