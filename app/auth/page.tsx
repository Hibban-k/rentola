"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { AuthContent } from "@/components/AuthContent";

export default function AuthPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }>
                <AuthContent />
            </Suspense>
        </div>
    );
}
