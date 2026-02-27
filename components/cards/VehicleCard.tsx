"use client";

import React, { useActionState, startTransition } from "react";
import Link from "next/link";
import { Car, Bike, IndianRupee, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Vehicle } from "@/lib/apiClient";
import { updateVehicleAvailabilityAction, deleteVehicleAction } from "@/lib/actions/vehicle.actions";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

interface VehicleCardProps {
    vehicle: Vehicle;
    variant?: "browse" | "provider";
}

function VehicleCard({
    vehicle,
    variant = "browse",
}: VehicleCardProps) {
    const TypeIcon = vehicle.type === "car" ? Car : Bike;

    // Server Actions
    const [toggleState, toggleAction, isToggling] = useActionState(updateVehicleAvailabilityAction, null);
    const [deleteState, deleteAction, isDeleting] = useActionState(deleteVehicleAction, null);

    const isActionLoading = isToggling || isDeleting;

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group">
            {/* Error indicator */}
            {(toggleState?.error || deleteState?.error) && (
                <div className="p-2 bg-destructive/5 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    {toggleState?.error || deleteState?.error}
                </div>
            )}

            {/* Image & Badges */}
            <div className="relative">
                <ResponsiveImage
                    src={vehicle.vehicleImageUrl?.[0]?.url || ""}
                    alt={vehicle.name}
                    fallbackType={vehicle.type === "car" ? "car" : "bike"}
                    aspectRatio="video"
                    containerClassName="h-48"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

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
                            onClick={() => {
                                startTransition(() => {
                                    toggleAction({ id: vehicle._id, isAvailable: !vehicle.isAvailable });
                                });
                            }}
                            disabled={isActionLoading}
                            className="flex-1 px-3 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {vehicle.isAvailable ? "Set Unavailable" : "Set Available"}
                        </button>
                        <Link
                            href={`/provider/vehicles/${vehicle._id}/edit`}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => {
                                if (confirm("Are you sure you want to delete this vehicle?")) {
                                    startTransition(() => {
                                        deleteAction(vehicle._id);
                                    });
                                }
                            }}
                            disabled={isActionLoading}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(VehicleCard);
