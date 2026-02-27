"use client";

import { ReactNode } from "react";
import { Package } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className = "",
}: EmptyStateProps) {
    return (
        <div className={`text-center py-16 ${className}`}>
            {icon ? (
                <div className="flex justify-center mb-4">
                    {icon}
                </div>
            ) : (
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            )}
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            {description && (
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {description}
                </p>
            )}
            {actionLabel && (actionHref || onAction) && (
                actionHref ? (
                    <Link
                        href={actionHref}
                        className="inline-flex px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        {actionLabel}
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        className="inline-flex px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        {actionLabel}
                    </button>
                )
            )}
        </div>
    );
}
