"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import UserCard from "@/components/cards/UserCard";
import { adminApi, UserInfo } from "@/lib/apiClient";
import { Users, Shield, Car, User as UserIcon } from "lucide-react";

type TabFilter = "all" | "user" | "provider" | "admin";

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabFilter>("all");

    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/auth");
            return;
        }

        if (session?.user?.role !== "admin") {
            router.push("/unauthorized");
            return;
        }

        fetchUsers();
    }, [router, status, session]);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await adminApi.getUsers();

            if (apiError) {
                throw new Error(apiError);
            }

            setUsers(data?.users || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = activeTab === "all"
        ? users
        : users.filter((u) => u.role === activeTab);

    const tabCounts = {
        user: users.filter((u) => u.role === "user").length,
        provider: users.filter((u) => u.role === "provider").length,
        admin: users.filter((u) => u.role === "admin").length,
    };

    return (
        <DashboardLayout role="admin">
            <PageHeader
                title="Users"
                subtitle="View all registered users"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-muted-foreground text-sm">Total</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
                        <UserIcon className="w-4 h-4" />
                        Renters
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">{tabCounts.user}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-500 text-sm mb-1">
                        <Car className="w-4 h-4" />
                        Providers
                    </div>
                    <p className="text-2xl font-bold text-blue-500">{tabCounts.provider}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
                        <Shield className="w-4 h-4" />
                        Admins
                    </div>
                    <p className="text-2xl font-bold text-red-500">{tabCounts.admin}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(["all", "user", "provider", "admin"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                            }`}
                    >
                        {tab === "user" ? "Renters" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab !== "all" && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-background/20">
                                {tabCounts[tab]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <LoadingSkeleton variant="card" count={3} />
            ) : error ? (
                <ErrorState message={error} onRetry={fetchUsers} />
            ) : filteredUsers.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title={activeTab === "all" ? "No users yet" : `No ${activeTab}s`}
                    description="Registered users will appear here."
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredUsers.map((user) => (
                        <UserCard key={user._id} user={user} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
