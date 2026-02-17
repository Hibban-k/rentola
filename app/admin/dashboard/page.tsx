"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Users, Clock, CheckCircle2, XCircle, Calendar, Car, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ProviderCard from "@/components/cards/ProviderCard";
import { adminApi, Provider } from "@/lib/apiClient";

type TabFilter = "pending" | "approved" | "rejected" | "all";

export default function AdminDashboardPage() {
    const router = useRouter();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabFilter>("pending");

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

        fetchProviders();
    }, [router, status, session]);

    const fetchProviders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await adminApi.getProviders();

            if (apiError) {
                throw new Error(apiError);
            }

            // Ensure data is always an array
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const providersList = Array.isArray(data) ? data : ((data as any)?.providers || []);
            setProviders(providersList);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load providers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setIsActionLoading(true);
        try {
            const { error: apiError } = await adminApi.approveProvider(id);

            if (!apiError) {
                setProviders((prev) =>
                    prev.map((p) =>
                        p._id === id ? { ...p, providerStatus: "approved" as const } : p
                    )
                );
            }
        } catch (err) {
            console.error("Failed to approve provider:", err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        setIsActionLoading(true);
        try {
            const { error: apiError } = await adminApi.rejectProvider(id);

            if (!apiError) {
                setProviders((prev) =>
                    prev.map((p) =>
                        p._id === id ? { ...p, providerStatus: "rejected" as const } : p
                    )
                );
            }
        } catch (err) {
            console.error("Failed to reject provider:", err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredProviders =
        activeTab === "all"
            ? providers
            : providers.filter((p) => p.providerStatus === activeTab);

    const tabCounts = {
        pending: providers.filter((p) => p.providerStatus === "pending").length,
        approved: providers.filter((p) => p.providerStatus === "approved").length,
        rejected: providers.filter((p) => p.providerStatus === "rejected").length,
    };

    return (
        <DashboardLayout role="admin">
            <PageHeader
                title="Admin Dashboard"
                subtitle="Manage provider approvals and platform overview"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{providers.length}</p>
                            <p className="text-sm text-muted-foreground">Total Providers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            <Clock className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{tabCounts.pending}</p>
                            <p className="text-sm text-amber-600/70">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">{tabCounts.approved}</p>
                            <p className="text-sm text-emerald-600/70">Approved</p>
                        </div>
                    </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{tabCounts.rejected}</p>
                            <p className="text-sm text-red-600/70">Rejected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <Link
                    href="/admin/providers"
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                >
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-medium">Providers</span>
                </Link>
                <Link
                    href="/admin/users"
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                >
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-medium">Users</span>
                </Link>
                <Link
                    href="/admin/rentals"
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                >
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium">Rentals</span>
                </Link>
                <Link
                    href="/vehicles"
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                >
                    <Car className="w-5 h-5 text-primary" />
                    <span className="font-medium">Vehicles</span>
                </Link>
            </div>

            {/* Provider Approvals Section */}
            <h2 className="text-xl font-bold mb-4">Provider Approvals</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab !== "all" && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-background/20">
                                {tabCounts[tab]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Providers List */}
            {isLoading ? (
                <LoadingSkeleton variant="card" count={3} />
            ) : error ? (
                <ErrorState message={error} onRetry={fetchProviders} />
            ) : filteredProviders.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title={activeTab === "pending" ? "No pending requests" : `No ${activeTab} providers`}
                    description={activeTab === "pending" ? "No pending approval requests at the moment." : `No ${activeTab} providers.`}
                />
            ) : (
                <div className="space-y-4">
                    {filteredProviders.map((provider) => (
                        <ProviderCard
                            key={provider._id}
                            provider={provider}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            isActionLoading={isActionLoading}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
