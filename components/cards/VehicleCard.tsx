"use client";

import Image from "next/image";
import Link from "next/link";
import { Car, Bike, IndianRupee } from "lucide-react";
import { Vehicle } from "@/lib/apiClient";
import React from "react";

interface VehicleCardProps {
    vehicle: Vehicle;
    variant?: "browse" | "provider";
    onToggleAvailability?: (id: string, currentStatus: boolean) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    isActionLoading?: boolean;
}

function VehicleCard({
    vehicle,
    variant = "browse",
    onToggleAvailability,
    onEdit,
    onDelete,
    isActionLoading = false,
}: VehicleCardProps) {
    const TypeIcon = vehicle.type === "car" ? Car : Bike;

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group">
            {/* Image */}
            <div className="relative h-48 bg-muted overflow-hidden">
                {vehicle.vehicleImageUrl?.[0]?.url ? (
                    <Image
                        src={vehicle.vehicleImageUrl[0].url}
                        alt={vehicle.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <TypeIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                )}

                {/* Type Badge */}
                <span className="absolute top-3 left-3 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium capitalize flex items-center gap-1">
                    <TypeIcon className="w-3 h-3" />
                    {vehicle.type}
                </span>

                {/* Availability Badge */}
                {variant === "provider" && (
                    <span
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${vehicle.isAvailable
                                ? "bg-emerald-500/90 text-white"
                                : "bg-red-500/90 text-white"
                            }`}
                    >
                        {vehicle.isAvailable ? "Available" : "Unavailable"}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 truncate">{vehicle.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">
                    {vehicle.licensePlate}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center text-primary font-bold">
                        <IndianRupee className="w-4 h-4" />
                        <span>{vehicle.pricePerDay.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground font-normal ml-1">/day</span>
                    </div>

                    {variant === "browse" && (
                        <Link
                            href={`/vehicles/${vehicle._id}`}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            View Details
                        </Link>
                    )}
                </div>

                {/* Provider Actions */}
                {variant === "provider" && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <button
                            onClick={() => onToggleAvailability?.(vehicle._id, vehicle.isAvailable)}
                            disabled={isActionLoading}
                            className="flex-1 px-3 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {vehicle.isAvailable ? "Set Unavailable" : "Set Available"}
                        </button>
                        <button
                            onClick={() => onEdit?.(vehicle._id)}
                            className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete?.(vehicle._id)}
                            disabled={isActionLoading}
                            className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Use React.memo for performance in lists
export default React.memo(VehicleCard);
