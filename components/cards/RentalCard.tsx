"use client";

import Image from "next/image";
import Link from "next/link";
import { Car, Calendar, MapPin } from "lucide-react";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";
import { Rental } from "@/lib/apiClient";
import React from "react";

interface RentalCardProps {
    rental: Rental;
    variant?: "user" | "provider" | "admin";
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
    isActionLoading?: boolean;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function RentalCard({
    rental,
    variant = "user",
    onAccept,
    onReject,
    isActionLoading = false,
}: RentalCardProps) {
    const vehicle = rental.vehicleId;

    return (
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Vehicle Image */}
                <div className="relative w-full md:w-40 h-32 bg-muted rounded-xl overflow-hidden shrink-0">
                    {vehicle?.vehicleImageUrl?.[0]?.url ? (
                        <Image
                            src={vehicle.vehicleImageUrl[0].url}
                            alt={vehicle.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 160px"
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
                                href={`/user/rentals/${rental?._id}`}
                                className="text-lg font-semibold hover:text-primary transition-colors"
                            >
                                {vehicle?.name || "Vehicle"}
                            </Link>
                            <p className="text-sm text-muted-foreground capitalize">
                                {vehicle?.type || "Vehicle"}
                            </p>
                        </div>
                        <StatusBadge status={rental.status as StatusType} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span>
                                {formatDate(rental.rentalPeriod.startDate)} → {formatDate(rental.rentalPeriod.endDate)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">
                                {rental.pickupLocation} → {rental.dropOffLocation}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                        {rental.totalCost > 0 && (
                            <p className="text-lg font-bold">
                                ₹{rental.totalCost.toLocaleString()}
                            </p>
                        )}

                        {/* Provider Actions */}
                        {variant === "provider" && rental.status === "pending" && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onAccept?.(rental._id)}
                                    disabled={isActionLoading}
                                    className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => onReject?.(rental._id)}
                                    disabled={isActionLoading}
                                    className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        )}

                        {/* Admin Actions */}
                        {variant === "admin" && (
                            <Link
                                href={`/admin/rentals/${rental._id}`}
                                className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors"
                            >
                                View Details
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Use React.memo for performance in lists
export default React.memo(RentalCard);
