"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Car, Calendar, MapPin, User, ArrowLeft, Check, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";
import { providerApi, Rental } from "@/lib/apiClient";

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function ProviderRentalDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const router = useRouter();
    const [rental, setRental] = useState<Rental | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/auth");
            return;
        }

        if (session?.user?.role !== "provider") {
            router.push("/unauthorized");
            return;
        }

        if (session.user.providerStatus !== "approved") {
            router.push("/provider/pending");
            return;
        }

        fetchRental();
    }, [router, status, session, id]);

    const fetchRental = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await providerApi.getRentals();

            if (apiError) {
                throw new Error(apiError);
            }

            const rentals = data || [];
            const foundRental = rentals.find((r) => r._id === id);

            if (!foundRental) {
                setError("Rental not found");
                return;
            }

            setRental(foundRental);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load rental");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: "active" | "cancelled") => {
        if (!rental) return;

        setIsActionLoading(true);
        try {
            const { error: apiError } = await providerApi.updateRentalStatus(rental._id, newStatus);

            if (apiError) {
                throw new Error(apiError);
            }

            // Refresh data
            await fetchRental();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update rental");
        } finally {
            setIsActionLoading(false);
        }
    };

    const vehicle = rental?.vehicleId;

    return (
        <DashboardLayout role="provider">
            <PageHeader
                title="Rental Details"
                subtitle="View and manage this booking"
                actions={
                    <Link
                        href="/provider/rentals"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Rentals
                    </Link>
                }
            />

            {isLoading ? (
                <LoadingSkeleton variant="card" count={1} />
            ) : error ? (
                <ErrorState message={error} onRetry={fetchRental} />
            ) : rental ? (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vehicle Card */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="relative h-64 bg-muted">
                                {vehicle?.vehicleImageUrl?.[0]?.url ? (
                                    <Image
                                        src={vehicle.vehicleImageUrl[0].url}
                                        alt={vehicle.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Car className="w-16 h-16 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">{vehicle?.name || "Vehicle"}</h2>
                                        <p className="text-muted-foreground capitalize">{vehicle?.type}</p>
                                    </div>
                                    <StatusBadge status={rental.status as StatusType} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Rental Period</p>
                                            <p className="font-medium">
                                                {formatDate(rental.rentalPeriod.startDate)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">to</p>
                                            <p className="font-medium">
                                                {formatDate(rental.rentalPeriod.endDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Locations</p>
                                            <p className="font-medium">From: {rental.pickupLocation}</p>
                                            <p className="font-medium">To: {rental.dropOffLocation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Renter Info */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Renter Information
                            </h3>
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <p className="text-sm text-muted-foreground">Renter ID</p>
                                <p className="font-mono text-sm">{rental.renterId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Summary */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-semibold mb-4">Booking Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Daily Rate</span>
                                    <span>₹{vehicle?.pricePerDay?.toLocaleString() || 0}/day</span>
                                </div>
                                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                                    <span>Total Earnings</span>
                                    <span className="text-primary">₹{rental.totalCost.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {rental.status === "pending" && (
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 className="font-semibold mb-4">Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleStatusUpdate("active")}
                                        disabled={isActionLoading}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                        Accept Booking
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate("cancelled")}
                                        disabled={isActionLoading}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject Booking
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Booking ID */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-semibold mb-2">Booking ID</h3>
                            <p className="font-mono text-sm text-muted-foreground break-all">
                                {rental._id}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </DashboardLayout>
    );
}
