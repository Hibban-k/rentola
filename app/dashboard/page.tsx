"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Car,
    Calendar,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2
} from "lucide-react";
import { rentalsApi, authApi, Rental } from "@/lib/apiClient";

type TabFilter = "all" | "pending" | "active" | "completed" | "cancelled";

const statusConfig = {
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
    active: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10", label: "Active" },
    completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Completed" },
    cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Cancelled" },
};

export default function RenterDashboardPage() {
    const router = useRouter();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabFilter>("all");

    useEffect(() => {
        if (!authApi.isLoggedIn()) {
            router.push("/auth/signin");
            return;
        }

        const fetchRentals = async () => {
            try {
                const { data, error: apiError } = await rentalsApi.list();

                if (apiError) {
                    if (apiError === "Network error") {
                        authApi.logout();
                        router.push("/auth/signin");
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

        fetchRentals();
    }, [router]);

    const filteredRentals = activeTab === "all"
        ? rentals
        : rentals.filter((r) => r.status === activeTab);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">My Rentals</h1>
                        <p className="text-muted-foreground">
                            Track and manage your vehicle bookings
                        </p>
                    </div>

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
                                {tab === "all" ? "All Bookings" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {tab !== "all" && (
                                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-background/20">
                                        {rentals.filter((r) => r.status === tab).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                                    <div className="flex gap-4">
                                        <div className="w-32 h-24 bg-muted rounded-xl" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-5 bg-muted rounded w-1/3" />
                                            <div className="h-4 bg-muted rounded w-1/4" />
                                            <div className="h-4 bg-muted rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
                            <p className="text-destructive">{error}</p>
                        </div>
                    ) : filteredRentals.length === 0 ? (
                        <div className="text-center py-16">
                            <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {activeTab === "all" ? "No rentals yet" : `No ${activeTab} rentals`}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {activeTab === "all" ? "Start exploring vehicles to book your first ride!" : "Check other tabs for your bookings."}
                            </p>
                            {activeTab === "all" && (
                                <Link
                                    href="/vehicles"
                                    className="inline-flex px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    Browse Vehicles
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRentals.map((rental) => {
                                const StatusIcon = statusConfig[rental.status].icon;
                                const vehicle = rental.vehicleId;

                                return (
                                    <div
                                        key={rental._id}
                                        className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Vehicle Image */}
                                            <div className="relative w-full md:w-40 h-32 bg-muted rounded-xl overflow-hidden shrink-0">
                                                {vehicle?.vehicleImageUrl?.[0]?.url ? (
                                                    <Image
                                                        src={vehicle.vehicleImageUrl[0].url}
                                                        alt={vehicle.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Car className="w-10 h-10 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                                    <div>
                                                        <Link
                                                            href={`/vehicles/${vehicle?._id}`}
                                                            className="text-lg font-semibold hover:text-primary transition-colors"
                                                        >
                                                            {vehicle?.name || "Vehicle"}
                                                        </Link>
                                                        <p className="text-sm text-muted-foreground capitalize">
                                                            {vehicle?.type || "Vehicle"}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[rental.status].bg} ${statusConfig[rental.status].color}`}
                                                    >
                                                        <StatusIcon className="w-4 h-4" />
                                                        {statusConfig[rental.status].label}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {formatDate(rental.rentalPeriod.startDate)} → {formatDate(rental.rentalPeriod.endDate)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="truncate">
                                                            {rental.pickupLocation} → {rental.dropOffLocation}
                                                        </span>
                                                    </div>
                                                </div>

                                                {rental.totalCost > 0 && (
                                                    <p className="mt-4 text-lg font-bold">
                                                        ₹{rental.totalCost.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
