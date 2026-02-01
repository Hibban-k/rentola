"use client";

import { useState, useEffect, use, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Car,
    Bike,
    ArrowLeft,
    Calendar,
    MapPin,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { vehiclesApi, rentalsApi, authApi } from "@/lib/apiClient";

interface Vehicle {
    _id: string;
    name: string;
    type: "car" | "bike";
    pricePerDay: number;
    vehicleImageUrl: { type: string; url: string }[];
    isAvailable: boolean;
}

export default function BookVehiclePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        pickupLocation: "",
        dropOffLocation: "",
    });

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const { data, error: apiError } = await vehiclesApi.get(id);

                if (apiError) throw new Error(apiError);

                setVehicle(data?.vehicle as Vehicle || null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load vehicle");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicle();
    }, [id]);

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const totalCost = vehicle ? calculateDays() * vehicle.pricePerDay : 0;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!authApi.isLoggedIn()) {
            router.push("/auth/signin");
            return;
        }

        if (calculateDays() < 1) {
            setError("End date must be after start date");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error: apiError } = await rentalsApi.create({
                vehicleId: id,
                startDate: formData.startDate,
                endDate: formData.endDate,
                pickupLocation: formData.pickupLocation,
                dropOffLocation: formData.dropOffLocation,
            });

            if (apiError) {
                throw new Error(apiError || "Booking failed");
            }

            setSuccess(true);

            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 pt-24 container mx-auto px-4">
                    <div className="animate-pulse space-y-8 max-w-2xl mx-auto">
                        <div className="h-8 w-32 bg-muted rounded" />
                        <div className="h-32 bg-muted rounded-2xl" />
                        <div className="space-y-4">
                            <div className="h-12 bg-muted rounded-xl" />
                            <div className="h-12 bg-muted rounded-xl" />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error && !vehicle) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 pt-24 container mx-auto px-4 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Unable to book</h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Link
                            href="/vehicles"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Vehicles
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={`/vehicles/${id}`}
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Vehicle
                        </Link>
                        <h1 className="text-3xl font-bold">Book Vehicle</h1>
                    </div>

                    {/* Vehicle Summary */}
                    {vehicle && (
                        <div className="bg-card border border-border rounded-2xl p-4 mb-8">
                            <div className="flex gap-4">
                                <div className="relative w-24 h-20 bg-muted rounded-xl overflow-hidden shrink-0">
                                    {vehicle.vehicleImageUrl?.[0]?.url ? (
                                        <Image
                                            src={vehicle.vehicleImageUrl[0].url}
                                            alt={vehicle.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {vehicle.type === "car" ? (
                                                <Car className="w-8 h-8 text-muted-foreground" />
                                            ) : (
                                                <Bike className="w-8 h-8 text-muted-foreground" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{vehicle.name}</h3>
                                    <p className="text-sm text-muted-foreground capitalize">{vehicle.type}</p>
                                    <p className="text-primary font-bold mt-1">
                                        ₹{vehicle.pricePerDay.toLocaleString()}/day
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-center gap-3 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            <div>
                                <p className="font-semibold text-emerald-700 dark:text-emerald-400">Booking Confirmed!</p>
                                <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
                            </div>
                        </div>
                    )}

                    {/* Booking Form */}
                    {!success && (
                        <div className="bg-card border border-border rounded-2xl p-6">
                            {error && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
                                    <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Dates */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium mb-1.5">
                                            <Calendar className="w-4 h-4 inline mr-1.5" />
                                            Start Date
                                        </label>
                                        <input
                                            id="startDate"
                                            type="date"
                                            required
                                            min={today}
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className="block text-sm font-medium mb-1.5">
                                            <Calendar className="w-4 h-4 inline mr-1.5" />
                                            End Date
                                        </label>
                                        <input
                                            id="endDate"
                                            type="date"
                                            required
                                            min={formData.startDate || today}
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Locations */}
                                <div>
                                    <label htmlFor="pickupLocation" className="block text-sm font-medium mb-1.5">
                                        <MapPin className="w-4 h-4 inline mr-1.5" />
                                        Pickup Location
                                    </label>
                                    <input
                                        id="pickupLocation"
                                        type="text"
                                        required
                                        value={formData.pickupLocation}
                                        onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        placeholder="e.g., Mumbai Airport"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="dropOffLocation" className="block text-sm font-medium mb-1.5">
                                        <MapPin className="w-4 h-4 inline mr-1.5" />
                                        Drop-off Location
                                    </label>
                                    <input
                                        id="dropOffLocation"
                                        type="text"
                                        required
                                        value={formData.dropOffLocation}
                                        onChange={(e) => setFormData({ ...formData, dropOffLocation: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        placeholder="e.g., Pune Station"
                                    />
                                </div>

                                {/* Price Summary */}
                                {calculateDays() > 0 && (
                                    <div className="bg-muted rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-muted-foreground">
                                                ₹{vehicle?.pricePerDay.toLocaleString()} × {calculateDays()} days
                                            </span>
                                            <span className="font-medium">₹{totalCost.toLocaleString()}</span>
                                        </div>
                                        <div className="border-t border-border pt-2 flex justify-between items-center">
                                            <span className="font-semibold">Total</span>
                                            <span className="text-xl font-bold">₹{totalCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !vehicle?.isAvailable}
                                    className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isSubmitting ? "Booking..." : "Confirm Booking"}
                                </button>

                                {!vehicle?.isAvailable && (
                                    <p className="text-center text-sm text-destructive">
                                        This vehicle is currently unavailable for booking.
                                    </p>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
