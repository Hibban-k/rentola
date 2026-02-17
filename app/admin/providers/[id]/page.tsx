"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Mail, FileText, Check, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";
import { adminApi, Provider } from "@/lib/apiClient";

export default function AdminProviderDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const router = useRouter();
    const [provider, setProvider] = useState<Provider | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        fetchProvider();
    }, [router, status, session, id]);

    const fetchProvider = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await adminApi.getProvider(id);

            if (apiError) {
                throw new Error(apiError);
            }

            setProvider(data || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load provider");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: "approved" | "rejected") => {
        setIsActionLoading(true);
        try {
            const { error: apiError } = await adminApi.updateProviderStatus(id, newStatus);

            if (apiError) {
                throw new Error(apiError);
            }

            await fetchProvider();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update provider");
        } finally {
            setIsActionLoading(false);
        }
    };

    const statusMap: Record<"pending" | "approved" | "rejected", StatusType> = {
        pending: "pending",
        approved: "approved",
        rejected: "rejected",
    };

    return (
        <DashboardLayout role="admin">
            <PageHeader
                title="Provider Details"
                subtitle="View and manage provider account"
                actions={
                    <Link
                        href="/admin/providers"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Providers
                    </Link>
                }
            />

            {isLoading ? (
                <LoadingSkeleton variant="card" count={1} />
            ) : error ? (
                <ErrorState message={error} onRetry={fetchProvider} />
            ) : provider ? (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Provider Card */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                                        <Shield className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{provider.name}</h2>
                                        <p className="text-muted-foreground">{provider.email}</p>
                                    </div>
                                </div>
                                <StatusBadge status={statusMap[provider.providerStatus]} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{provider.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <p className="font-medium capitalize">{provider.providerStatus}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        {provider.documents && provider.documents.length > 0 && (
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Submitted Documents
                                </h3>
                                <div className="space-y-3">
                                    {provider.documents.map((doc, index) => (
                                        <a
                                            key={index}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                                        >
                                            <FileText className="w-5 h-5 text-muted-foreground" />
                                            <span className="capitalize">{doc.type}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-semibold mb-4">Actions</h3>

                            {provider.providerStatus === "pending" ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleStatusUpdate("approved")}
                                        disabled={isActionLoading}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                        Approve Provider
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate("rejected")}
                                        disabled={isActionLoading}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject Provider
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    This provider has been {provider.providerStatus}.
                                </p>
                            )}
                        </div>

                        {/* Provider ID */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-semibold mb-2">Provider ID</h3>
                            <p className="font-mono text-sm text-muted-foreground break-all">
                                {provider._id}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </DashboardLayout>
    );
}
