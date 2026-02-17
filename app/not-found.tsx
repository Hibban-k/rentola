"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="mb-6">
                    <span className="text-8xl font-bold text-primary/20">404</span>
                </div>

                <div className="w-16 h-16 mx-auto mb-6 bg-amber-500/10 rounded-full flex items-center justify-center">
                    <FileQuestion className="w-8 h-8 text-amber-500" />
                </div>

                <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>

                <p className="text-muted-foreground mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go to Home
                    </Link>

                    <button
                        onClick={() => typeof window !== "undefined" && window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
