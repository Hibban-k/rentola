"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ProviderCard from "@/components/cards/ProviderCard";
import { adminApi } from "@/lib/apiClient";
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Provider {
    _id: string;
    email?: string;
    providerStatus: "pending" | "approved" | "rejected";
    createdAt?: string;
}

type TabFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminProvidersPage() {
    const router = useRouter();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
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

            if (apiError) {
                throw new Error(apiError);
            }

            await fetchProviders();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to approve provider");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        setIsActionLoading(true);
        try {
            const { error: apiError } = await adminApi.rejectProvider(id);

            if (apiError) {
                throw new Error(apiError);
            }

            await fetchProviders();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reject provider");
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredProviders = activeTab === "all"
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
                title="Providers"
                subtitle="Manage provider applications and accounts"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-muted-foreground text-sm">Total</p>
                    <p className="text-2xl font-bold">{providers.length}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-500 text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        Pending
                    </div>
                    <p className="text-2xl font-bold text-amber-500">{tabCounts.pending}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Approved
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">{tabCounts.approved}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
                        <XCircle className="w-4 h-4" />
                        Rejected
                    </div>
                    <p className="text-2xl font-bold text-red-500">{tabCounts.rejected}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
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

            {/* Content */}
            {isLoading ? (
                <LoadingSkeleton variant="card" count={3} />
            ) : error ? (
                <ErrorState message={error} onRetry={fetchProviders} />
            ) : filteredProviders.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title={activeTab === "all" ? "No providers yet" : `No ${activeTab} providers`}
                    description="Provider applications will appear here."
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
