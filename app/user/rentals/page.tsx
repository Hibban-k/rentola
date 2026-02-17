"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Car } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import RentalCard from "@/components/cards/RentalCard";
import { rentalsApi, Rental } from "@/lib/apiClient";

type TabFilter = "all" | "pending" | "active" | "completed" | "cancelled";

export default function UserRentalsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabFilter>("all");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth");
            return;
        }

        if (status === "authenticated") {
            fetchRentals();
        }
    }, [status, router]);

    const fetchRentals = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await rentalsApi.list();

            if (apiError) {
                if (apiError === "Network error") {
                    signOut({ callbackUrl: "/auth" });
                    return;
                }
                throw new Error(apiError);
            }

            setRentals(data?.rentals || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load rentals");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRentals = activeTab === "all"
        ? rentals
        : rentals.filter((r) => r.status === activeTab);

    const tabCounts = {
        pending: rentals.filter((r) => r.status === "pending").length,
        active: rentals.filter((r) => r.status === "active").length,
        completed: rentals.filter((r) => r.status === "completed").length,
        cancelled: rentals.filter((r) => r.status === "cancelled").length,
    };

    return (
        <DashboardLayout role="user">
            <PageHeader
                title="All Rentals"
                subtitle="View all your rental history"
            />

            {/* Status Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {(["all", "pending", "active", "completed", "cancelled"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                            }`}
                    >
                        {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                <ErrorState message={error} onRetry={fetchRentals} />
            ) : filteredRentals.length === 0 ? (
                <EmptyState
                    icon={Car}
                    title={activeTab === "all" ? "No rentals yet" : `No ${activeTab} rentals`}
                    description={
                        activeTab === "all"
                            ? "Start exploring vehicles to book your first ride!"
                            : "Check other tabs for your bookings."
                    }
                    actionLabel={activeTab === "all" ? "Browse Vehicles" : undefined}
                    actionHref={activeTab === "all" ? "/vehicles" : undefined}
                />
            ) : (
                <div className="space-y-4">
                    {filteredRentals.map((rental) => (
                        <RentalCard key={rental._id} rental={rental} variant="user" />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
