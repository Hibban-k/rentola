"use client";

import { LucideIcon } from "lucide-react";
import {
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
} from "lucide-react";

import { RentalStatus, ProviderStatus } from "@/types";

export type StatusType = RentalStatus | ProviderStatus;

interface StatusConfig {
    icon: LucideIcon;
    color: string;
    bg: string;
    label: string;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
    active: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10", label: "Active" },
    completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Completed" },
    cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Cancelled" },
    approved: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Approved" },
    rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Rejected" },
};

interface StatusBadgeProps {
    status: StatusType;
    size?: "sm" | "md";
    className?: string;
}

export default function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
    const config = statusConfigs[status];
    const Icon = config.icon;

    const sizeClasses = size === "sm"
        ? "px-2 py-0.5 text-xs gap-1"
        : "px-3 py-1 text-sm gap-2";

    const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${config.bg} ${config.color} ${className}`}
        >
            <Icon className={`${iconSize} ${status === "active" ? "animate-spin" : ""}`} />
            {config.label}
        </span>
    );
}
