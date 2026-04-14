"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useRef, useEffect, useState } from "react";

interface AdminTabsProps {
    activeTab: string;
    baseUrl: string;
    counts: {
        pending: number;
        approved: number;
        rejected: number;
    };
}

const tabs = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All" },
];

export default function AdminTabs({ activeTab, baseUrl, counts }: AdminTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isPending, startTransition] = useTransition();
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

    useEffect(() => {
        if (!containerRef.current) return;
        
        // Find the index of the currently active tab
        const activeButtonIndex = tabs.findIndex(t => t.id === activeTab);
        if (activeButtonIndex === -1) return;

        // Add 1 to index because the absolute indicator pill is the first child element
        const button = containerRef.current.children[activeButtonIndex + 1] as HTMLElement;
        
        if (button) {
            setIndicatorStyle({
                left: button.offsetLeft,
                width: button.offsetWidth,
                opacity: 1, // Make visible once calculated
            });
        }
    }, [activeTab, tabs]);

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("status", tabId);

        startTransition(() => {
            router.push(`${baseUrl}?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div 
            ref={containerRef}
            className="relative flex gap-2 mb-6 overflow-x-auto pb-2"
        >
            {/* The sliding background pill */}
            <div 
                className="absolute top-0 bottom-2 bg-primary rounded-full transition-all duration-300 ease-in-out z-0 pointer-events-none"
                style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`,
                    opacity: indicatorStyle.opacity,
                }}
            />

            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        disabled={isPending && isActive}
                        className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                            isActive
                                ? "text-primary-foreground"
                                : "text-foreground hover:bg-muted/50"
                        } ${isPending && !isActive ? "opacity-50 cursor-wait" : ""}`}
                    >
                        {tab.label}
                        {tab.id !== "all" && (
                            <span 
                                className={`ml-2 px-1.5 py-0.5 rounded-full text-xs transition-colors duration-300 ${
                                    isActive ? "bg-background/20" : "bg-muted text-muted-foreground"
                                }`}
                            >
                                {counts[tab.id as keyof typeof counts]}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
