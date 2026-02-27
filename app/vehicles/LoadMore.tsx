"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface LoadMoreProps {
    hasMore: boolean;
    currentPage: number;
}

export default function LoadMore({ hasMore, currentPage }: LoadMoreProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    if (!hasMore) return null;

    const handleLoadMore = () => {
        setIsLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", (currentPage + 1).toString());

        // Use scroll: false if we want to mimic infinite scroll behavior 
        // without jumping back to header (standard behavior for Load More)
        router.push(`/vehicles?${params.toString()}`, { scroll: false });
        setIsLoading(false);
    };

    return (
        <div className="mt-12 flex justify-center">
            <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-8 py-3 bg-card border border-border rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
                {isLoading ? "Loading..." : "Load More Vehicles"}
            </button>
        </div>
    );
}
