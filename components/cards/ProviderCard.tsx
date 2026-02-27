"use client";

import React, { useActionState, startTransition } from "react";
import Link from "next/link";
import { User, Shield, Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle } from "lucide-react";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";
import { approveProviderAction, rejectProviderAction } from "@/lib/actions/admin.actions";

interface Provider {
    _id: string;
    email?: string;
    providerStatus: "pending" | "approved" | "rejected";
    createdAt?: string;
}

interface ProviderCardProps {
    provider: Provider;
    onApprove?: (id: string) => Promise<void>;
    onReject?: (id: string) => Promise<void>;
    isActionLoading?: boolean;
}

function ProviderCard({
    provider,
    onApprove,
    onReject,
    isActionLoading: isParentLoading = false,
}: ProviderCardProps) {
    // Server Actions
    const [approveState, approveAction, isApproving] = useActionState(approveProviderAction, null);
    const [rejectState, rejectAction, isRejecting] = useActionState(rejectProviderAction, null);

    const isActionLoading = isApproving || isRejecting || isParentLoading;

    const statusMap: Record<"pending" | "approved" | "rejected", StatusType> = {
        pending: "pending",
        approved: "approved",
        rejected: "rejected",
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
            {/* Error indicators */}
            {(approveState?.error || rejectState?.error) && (
                <div className="mb-4 text-xs text-destructive bg-destructive/5 p-2 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    {approveState?.error || rejectState?.error}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold truncate">{provider.email || "Provider"}</p>
                        <p className="text-sm text-muted-foreground font-mono truncate">
                            {provider._id}
                        </p>
                    </div>
                </div>

                <StatusBadge status={statusMap[provider.providerStatus]} />
            </div>

            {/* Actions for pending providers */}
            {provider.providerStatus === "pending" && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <button
                        onClick={() => {
                            if (onApprove) {
                                onApprove(provider._id);
                            } else {
                                startTransition(() => {
                                    approveAction(provider._id);
                                });
                            }
                        }}
                        disabled={isActionLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                    </button>
                    <button
                        onClick={() => {
                            if (onReject) {
                                onReject(provider._id);
                            } else {
                                startTransition(() => {
                                    rejectAction(provider._id);
                                });
                            }
                        }}
                        disabled={isActionLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                        <XCircle className="w-4 h-4" />
                        Reject
                    </button>
                </div>
            )}

            {provider.providerStatus !== "pending" && (
                <div className="mt-4 pt-4 border-t border-border">
                    <Link
                        href={`/admin/providers/${provider._id}`}
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}

export default React.memo(ProviderCard);
