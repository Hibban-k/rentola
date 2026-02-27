"use client";

import { useState, useActionState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
    Car,
    Bike,
    Calendar,
    MapPin,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { Vehicle } from "@/lib/apiClient";
import { createRentalAction } from "@/lib/actions/rental.actions";
import CalendarPicker from "@/components/ui/CalendarPicker";
import PlatformChargeInfo from "@/components/ui/PlatformChargeInfo";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

interface BookingFormProps {
    vehicle: Vehicle;
    id: string;
}

export default function BookingForm({ vehicle, id }: BookingFormProps) {
    const router = useRouter();
    const { status } = useSession();

    const [state, formAction, isPending] = useActionState(createRentalAction, null);

    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
    });

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (state?.success) {
            setTimeout(() => {
                router.push("/user/dashboard");
            }, 2000);
        }
    }, [state, router]);

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const PLATFORM_CHARGE = 9;
    const days = calculateDays();
    const rentalCost = days * vehicle.pricePerDay;
    const totalCost = days > 0 ? rentalCost + PLATFORM_CHARGE : 0;

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (status === "unauthenticated") {
            router.push(`/auth?callbackUrl=/vehicles/${id}/book`);
            return;
        }

        if (calculateDays() < 1) {
            return; // Should be handled by validation/state
        }

        startTransition(() => {
            formAction({
                vehicleId: id,
                startDate: formData.startDate,
                endDate: formData.endDate,
            });
        });
    };

    return (
        <>
            {/* Vehicle Summary */}
            <div className="bg-card border border-border rounded-2xl p-4 mb-8">
                <div className="flex gap-4">
                    <ResponsiveImage
                        src={vehicle.vehicleImageUrl?.[0]?.url || ""}
                        alt={vehicle.name}
                        fallbackType={vehicle.type === "car" ? "car" : "bike"}
                        aspectRatio="video"
                        containerClassName="w-24 h-20 rounded-xl shrink-0"
                        sizes="96px"
                    />
                    <div className="flex-1">
                        <h3 className="font-semibold">{vehicle.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{vehicle.type}</p>
                        <p className="text-primary font-bold mt-1">
                            ₹{vehicle.pricePerDay.toLocaleString()}/day
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {state?.success && (
                <div className="flex items-center gap-3 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <div>
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">Booking Confirmed!</p>
                        <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
                    </div>
                </div>
            )}

            {/* Booking Form */}
            {!state?.success && (
                <div className="bg-card border border-border rounded-2xl p-6">
                    {(state?.error || (calculateDays() < 1 && formData.endDate !== "")) && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                            <p className="text-sm text-destructive">
                                {state?.error || (calculateDays() < 1 ? "End date must be after start date" : "")}
                            </p>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <CalendarPicker
                                label="Start Date"
                                selectedDate={formData.startDate}
                                onDateSelect={(date) => setFormData({ ...formData, startDate: date })}
                                minDate={today}
                                placeholder="Start date"
                            />
                            <CalendarPicker
                                label="End Date"
                                selectedDate={formData.endDate}
                                onDateSelect={(date) => setFormData({ ...formData, endDate: date })}
                                minDate={formData.startDate || today}
                                placeholder="End date"
                            />
                        </div>

                        {/* Pickup Station */}
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-primary">Pickup & Return Point</p>
                                    <p className="text-base font-semibold">{vehicle.pickupStation}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This vehicle must be picked up from and returned to this location.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Price Summary */}
                        {calculateDays() > 0 && (
                            <div className="bg-muted rounded-xl p-4 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Rental Fee (₹{vehicle.pricePerDay.toLocaleString()} × {calculateDays()} days)
                                    </span>
                                    <span className="font-medium">₹{rentalCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Platform Charge
                                    </span>
                                    <span className="font-medium">₹{PLATFORM_CHARGE}</span>
                                </div>
                                <div className="border-t border-border pt-2 flex justify-between items-center">
                                    <span className="font-semibold">Total Amount</span>
                                    <span className="text-xl font-bold text-primary">₹{totalCost.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <PlatformChargeInfo className="bg-transparent border-none p-0" />

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending || !vehicle.isAvailable}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isPending ? "Booking..." : "Confirm Booking"}
                        </button>

                        {!vehicle.isAvailable && (
                            <p className="text-center text-sm text-destructive">
                                This vehicle is currently unavailable for booking.
                            </p>
                        )}
                    </form>
                </div>
            )}
        </>
    );
}
