"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, Mail, Shield, LogOut, LayoutDashboard } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface UserInfo {
    userId: string;
    role: "user" | "provider" | "admin";
    providerStatus?: "pending" | "approved" | "rejected";
}

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push("/auth");
        } else {
            setIsLoading(false);
        }
    }, [status, router]);

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    const getDashboardLink = () => {
        const user = session?.user;
        if (!user) return "/";
        switch (user.role) {
            case "admin":
                return "/admin/dashboard";
            case "provider":
                return user.providerStatus === "approved"
                    ? "/provider/dashboard"
                    : "/provider/pending";
            default:
                return "/dashboard";
        }
    };

    const getRoleLabel = () => {
        const user = session?.user;
        if (!user) return "";
        switch (user.role) {
            case "admin":
                return "Administrator";
            case "provider":
                return `Provider (${user.providerStatus || "pending"})`;
            default:
                return "Renter";
        }
    };

    const getRoleColor = () => {
        const user = session?.user;
        if (!user) return "text-gray-500";
        switch (user.role) {
            case "admin":
                return "text-red-500";
            case "provider":
                return "text-blue-500";
            default:
                return "text-emerald-500";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="pt-24 pb-12 px-4">
                    <div className="max-w-2xl mx-auto">
                        <LoadingSkeleton variant="card" count={1} />
                    </div>
                </div>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="pt-24 pb-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <PageHeader
                        title="My Profile"
                        subtitle="Manage your account settings"
                    />

                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        {/* Profile Header */}
                        <div className="p-6 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">My Account</p>
                                    <p className="font-medium text-lg">{session?.user?.name || "User"}</p>
                                    <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                                <Shield className={`w-5 h-5 ${getRoleColor()}`} />
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <p className={`font-medium ${getRoleColor()}`}>
                                        {getRoleLabel()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-border space-y-3">
                            <Link
                                href={getDashboardLink()}
                                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Go to Dashboard
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
