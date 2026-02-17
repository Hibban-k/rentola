"use client";

import React from "react";

type SkeletonVariant = "card" | "table-row" | "text" | "avatar" | "image";

interface LoadingSkeletonProps {
    variant?: SkeletonVariant;
    count?: number;
    className?: string;
}

function SkeletonPulse({ className = "" }: { className?: string }) {
    return <div className={`bg-muted animate-pulse rounded ${className}`} />;
}

function CardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex gap-4">
                <SkeletonPulse className="w-32 h-24 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                    <SkeletonPulse className="h-5 w-1/3" />
                    <SkeletonPulse className="h-4 w-1/4" />
                    <SkeletonPulse className="h-4 w-1/2" />
                </div>
            </div>
        </div>
    );
}

function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-border">
            <SkeletonPulse className="w-10 h-10 rounded-full shrink-0" />
            <SkeletonPulse className="h-4 flex-1" />
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-8 w-20 rounded-lg" />
        </div>
    );
}

function TextSkeleton() {
    return (
        <div className="space-y-2">
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-3/4" />
        </div>
    );
}

function AvatarSkeleton() {
    return <SkeletonPulse className="w-10 h-10 rounded-full" />;
}

function ImageSkeleton() {
    return <SkeletonPulse className="w-full h-48 rounded-xl" />;
}

export default function LoadingSkeleton({
    variant = "card",
    count = 1,
    className = ""
}: LoadingSkeletonProps) {
    const SkeletonComponent = {
        card: CardSkeleton,
        "table-row": TableRowSkeleton,
        text: TextSkeleton,
        avatar: AvatarSkeleton,
        image: ImageSkeleton,
    }[variant];

    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }, (_, i) => (
                <SkeletonComponent key={i} />
            ))}
        </div>
    );
}

// Export individual skeleton for custom compositions
export { SkeletonPulse, CardSkeleton, TableRowSkeleton };
