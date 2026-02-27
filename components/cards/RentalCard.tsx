"use client";

import React, { useActionState, startTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car, Calendar, MapPin, XCircle, CheckCircle, Trash2 } from "lucide-react";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";
import { Rental } from "@/lib/apiClient";
import { acceptRentalAction, rejectRentalAction, cancelRentalAction } from "@/lib/actions/rental.actions";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

interface RentalCardProps {
    rental: Rental;
    variant?: "user" | "provider" | "admin";
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
}: RentalCardProps) {
    const vehicle = rental.vehicleId;

    // Server Actions
    const [acceptState, acceptFormAction, isAccepting] = useActionState(acceptRentalAction, null);
    const [rejectState, rejectFormAction, isRejecting] = useActionState(rejectRentalAction, null);
    const [cancelState, cancelFormAction, isCancelling] = useActionState(cancelRentalAction, null);

    const isActionLoading = isAccepting || isRejecting || isCancelling;

    return (
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
            {/* Error indicators for actions */}
            {(acceptState?.error || rejectState?.error || cancelState?.error) && (
                <div className="mb-4 text-xs text-destructive bg-destructive/5 p-2 rounded-lg flex items-center gap-2">
                    <XCircle className="w-3 h-3" />
                    {acceptState?.error || rejectState?.error || cancelState?.error}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Vehicle Image */}
                <ResponsiveImage
                    src={vehicle?.vehicleImageUrl?.[0]?.url || ""}
                    alt={vehicle?.name || "Vehicle"}
                    fallbackType="car"
                    aspectRatio="video"
                    containerClassName="w-full md:w-40 h-32 rounded-xl shrink-0"
                    sizes="(max-width: 768px) 100vw, 160px"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                            <Link
                                href={variant === "provider" ? `/provider/rentals/${rental?._id}` : `/user/rentals/${rental?._id}`}
                                className="text-lg font-semibold hover:text-primary transition-colors"
                            >
                                {vehicle?.name || "Vehicle"}
                            </Link>
                            <p className="text-sm text-muted-foreground capitalize">
                                {vehicle?.type || "Vehicle"}
                                {variant === "user" && vehicle?.owner?.name && (
                                    <span className="ml-2 text-xs border-l border-border pl-2">
                                        By {vehicle.owner.name}
                                    </span>
                                )}
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
                                Pickup: {vehicle?.pickupStation || "Main Station"}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                        {rental.totalCost > 0 && (
                            <p className="text-lg font-bold">
                                ₹{rental.totalCost.toLocaleString()}
                            </p>
                        )}

                        <div className="flex gap-2">
                            {/* User Actions */}
                            {variant === "user" && rental.status === "pending" && (
                                <button
                                    onClick={() => {
                                        startTransition(() => {
                                            cancelFormAction(rental._id);
                                        });
                                    }}
                                    disabled={isActionLoading}
                                    className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive font-medium rounded-lg hover:bg-destructive/5 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Cancel Booking
                                </button>
                            )}

                            {/* Provider Actions */}
                            {variant === "provider" && rental.status === "pending" && (
                                <>
                                    <button
                                        onClick={() => {
                                            startTransition(() => {
                                                acceptFormAction(rental._id);
                                            });
                                        }}
                                        disabled={isActionLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => {
                                            startTransition(() => {
                                                rejectFormAction(rental._id);
                                            });
                                        }}
                                        disabled={isActionLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>

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
