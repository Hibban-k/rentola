"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface RentalTabsProps {
    activeTab: string;
    baseUrl: string;
    counts: {
        pending: number;
        active: number;
        completed: number;
        cancelled: number;
    };
}

export default function RentalTabs({ activeTab, baseUrl, counts }: RentalTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tabs = [
        { id: "all", label: "All" },
        { id: "pending", label: "Pending" },
        { id: "active", label: "Active" },
        { id: "completed", label: "Completed" },
        { id: "cancelled", label: "Cancelled" },
    ];

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (tabId === "all") {
            params.delete("status");
        } else {
            params.set("status", tabId);
        }
        router.push(`${baseUrl}?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                        }`}
                >
                    {tab.label}
                    {tab.id !== "all" && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-background/20">
                            {counts[tab.id as keyof typeof counts]}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
