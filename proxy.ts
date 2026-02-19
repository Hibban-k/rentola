import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Public routes that don't require authentication
const publicRoutes = [
    "/",
    "/auth",
    "/vehicles",
    "/about",
    "/api/auth",
    "/unauthorized",
    "/api/cron",
    "/api/vehicles",
];

// Check if the path matches any public route
function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Get the session token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // No token = not authenticated
    if (!token) {
        const signInUrl = new URL("/auth?mode=signin", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Role-based authorization for specific routes
    const role = token.role as string | undefined;
    const providerStatus = token.providerStatus as string | undefined;

    // Admin routes
    if (pathname.startsWith("/admin")) {
        if (role !== "admin") {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
    }

    // Provider routes
    if (pathname.startsWith("/provider")) {
        // Admin can access provider routes
        if (role === "admin") {
            return NextResponse.next();
        }

        // Must be a provider with approved status
        if (role !== "provider" || providerStatus !== "approved") {
            // If pending, redirect to pending page
            if (role === "provider" && providerStatus === "pending") {
                return NextResponse.redirect(
                    new URL("/provider/pending", request.url)
                );
            }
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
    }

    // User routes - any authenticated user can access
    if (pathname.startsWith("/user") || pathname.startsWith("/profile")) {
        // Already authenticated, allow access
        return NextResponse.next();
    }

    return NextResponse.next();
}

// Configure which routes the proxy should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
