"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Shield,
    Mail,
    Calendar,
    ChevronDown,
} from "lucide-react";
import { adminApi, authApi, Provider } from "@/lib/apiClient";

type TabFilter = "all" | "pending" | "approved" | "rejected";

const statusConfig = {
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
    approved: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Approved" },
    rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Rejected" },
};

export default function AdminDashboardPage() {
    const router = useRouter();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabFilter>("pending");
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!authApi.isLoggedIn()) {
            router.push("/auth/signin");
            return;
        }

        // Verify admin role
        try {
            const user = authApi.getCurrentUser();
            if (!user || user.role !== "admin") {
                router.push("/dashboard");
                return;
            }
        } catch {
            router.push("/auth/signin");
            return;
        }

        fetchProviders();
    }, [router]);

    const fetchProviders = async () => {
        try {
            const { data, error: apiError } = await adminApi.getProviders();

            if (apiError) {
                if (apiError === "Network error") {
                    authApi.logout();
                    router.push("/auth/signin");
                    return;
                }
                throw new Error(apiError);
            }

            setProviders(data?.providers || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load providers");
        } finally {
            setIsLoading(false);
        }
    };

    const updateProviderStatus = async (providerId: string, status: "approved" | "rejected") => {
        setProcessingIds((prev) => new Set(prev).add(providerId));

        try {
            const { error: apiError } = await adminApi.updateProviderStatus(providerId, status);

            if (!apiError) {
                setProviders((prev) =>
                    prev.map((p) =>
                        p._id === providerId ? { ...p, providerStatus: status } : p
                    )
                );
            }
        } catch (err) {
            console.error("Failed to update provider status:", err);
        } finally {
            setProcessingIds((prev) => {
                const next = new Set(prev);
                next.delete(providerId);
                return next;
            });
        }
    };

    const filteredProviders =
        activeTab === "all"
            ? providers
            : providers.filter((p) => p.providerStatus === activeTab);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Manage provider approvals</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
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
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-xl">
                                    <Clock className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {providers.filter((p) => p.providerStatus === "pending").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {providers.filter((p) => p.providerStatus === "approved").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Approved</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/10 rounded-xl">
                                    <XCircle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {providers.filter((p) => p.providerStatus === "rejected").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Rejected</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                        {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80"
                                    }`}
                            >
                                {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Providers List */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-full" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-5 bg-muted rounded w-1/3" />
                                            <div className="h-4 bg-muted rounded w-1/4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
                            <p className="text-destructive">{error}</p>
                        </div>
                    ) : filteredProviders.length === 0 ? (
                        <div className="text-center py-16 bg-card border border-border rounded-2xl">
                            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No providers found</h3>
                            <p className="text-muted-foreground">
                                {activeTab === "pending"
                                    ? "No pending approval requests at the moment."
                                    : `No ${activeTab} providers.`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProviders.map((provider) => {
                                const StatusIcon = statusConfig[provider.providerStatus].icon;
                                const isProcessing = processingIds.has(provider._id);

                                return (
                                    <div
                                        key={provider._id}
                                        className="bg-card border border-border rounded-2xl p-6"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                            {/* Avatar */}
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                                <span className="text-lg font-bold text-primary">
                                                    {provider.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold">{provider.name}</h3>
                                                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <Mail className="w-4 h-4" />
                                                        {provider.email}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        Joined {formatDate(provider.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[provider.providerStatus].bg} ${statusConfig[provider.providerStatus].color}`}
                                                >
                                                    <StatusIcon className="w-4 h-4" />
                                                    {statusConfig[provider.providerStatus].label}
                                                </div>

                                                {provider.providerStatus === "pending" && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => updateProviderStatus(provider._id, "approved")}
                                                            disabled={isProcessing}
                                                            className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                                                        >
                                                            {isProcessing ? "..." : "Approve"}
                                                        </button>
                                                        <button
                                                            onClick={() => updateProviderStatus(provider._id, "rejected")}
                                                            disabled={isProcessing}
                                                            className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                                                        >
                                                            {isProcessing ? "..." : "Reject"}
                                                        </button>
                                                    </div>
                                                )}

                                                {provider.providerStatus !== "pending" && (
                                                    <div className="relative group">
                                                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                                            <ChevronDown className="w-5 h-5" />
                                                        </button>
                                                        <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                            <button
                                                                onClick={() =>
                                                                    updateProviderStatus(
                                                                        provider._id,
                                                                        provider.providerStatus === "approved" ? "rejected" : "approved"
                                                                    )
                                                                }
                                                                className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors whitespace-nowrap"
                                                            >
                                                                {provider.providerStatus === "approved" ? "Revoke Access" : "Approve"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
