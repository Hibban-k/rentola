"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import RentalCard from "@/components/cards/RentalCard";
import { adminApi, Rental } from "@/lib/apiClient";
import { Calendar, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type TabFilter = "all" | "pending" | "active" | "completed" | "cancelled";

export default function AdminRentalsPage() {
    const router = useRouter();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabFilter>("all");

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

        fetchRentals();
    }, [router, status, session]);

    const fetchRentals = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await adminApi.getAllRentals();

            if (apiError) {
                throw new Error(apiError);
            }

            // Ensure data is always an array
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rentalsList = Array.isArray(data) ? data : ((data as any)?.rentals || []);
            setRentals(rentalsList);
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

    // Calculate total revenue (₹9 from renter + ₹9 from provider = ₹18 per rental)
    const platformFeePerRental = 18;
    const totalRevenue = rentals
        .filter((r) => r.status === "completed" || r.status === "active")
        .length * platformFeePerRental;

    return (
        <DashboardLayout role="admin">
            <PageHeader
                title="All Rentals"
                subtitle="View and manage all platform rentals"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-muted-foreground text-sm">Total</p>
                    <p className="text-2xl font-bold">{rentals.length}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-500 text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        Pending
                    </div>
                    <p className="text-2xl font-bold text-amber-500">{tabCounts.pending}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-500 text-sm mb-1">
                        <Loader2 className="w-4 h-4" />
                        Active
                    </div>
                    <p className="text-2xl font-bold text-blue-500">{tabCounts.active}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">{tabCounts.completed}</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 col-span-2 sm:col-span-1">
                    <p className="text-primary text-sm mb-1">Revenue</p>
                    <p className="text-2xl font-bold text-primary">₹{totalRevenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(["all", "pending", "active", "completed", "cancelled"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                    icon={<Calendar className="w-16 h-16 text-muted-foreground" />}
                    title={activeTab === "all" ? "No rentals yet" : `No ${activeTab} rentals`}
                    description="Rental bookings will appear here."
                />
            ) : (
                <div className="space-y-4">
                    {filteredRentals.map((rental) => (
                        <RentalCard key={rental._id} rental={rental} variant="admin" />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
