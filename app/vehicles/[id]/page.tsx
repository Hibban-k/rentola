"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Car, Bike, ArrowLeft, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";
import { vehiclesApi, Vehicle } from "@/lib/apiClient";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    const nextImage = () => {
        if (vehicle && vehicle.vehicleImageUrl.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % vehicle.vehicleImageUrl.length);
        }
    };

    const prevImage = () => {
        if (vehicle && vehicle.vehicleImageUrl.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? vehicle.vehicleImageUrl.length - 1 : prev - 1
            );
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 pt-24 container mx-auto px-4">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 w-32 bg-muted rounded" />
                        <div className="aspect-video bg-muted rounded-2xl" />
                        <div className="h-10 w-2/3 bg-muted rounded" />
                        <div className="h-6 w-1/3 bg-muted rounded" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 pt-24 container mx-auto px-4 flex items-center justify-center">
                    <div className="text-center">
                        <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Vehicle not found</h2>
                        <p className="text-muted-foreground mb-6">{error || "This vehicle may have been removed."}</p>
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
                <div className="container mx-auto px-4">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden">
                                <ResponsiveImage
                                    src={vehicle.vehicleImageUrl?.[currentImageIndex]?.url || ""}
                                    alt={vehicle.name}
                                    fallbackType={vehicle.type === "car" ? "car" : "bike"}
                                    aspectRatio="video"
                                    priority
                                />
                                {vehicle.vehicleImageUrl && vehicle.vehicleImageUrl.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors z-10"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors z-10"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {vehicle.vehicleImageUrl && vehicle.vehicleImageUrl.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {vehicle.vehicleImageUrl.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${idx === currentImageIndex ? "border-primary" : "border-transparent"
                                                }`}
                                        >
                                            <Image src={img.url} alt="" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="space-y-6">
                            <div>
                                <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full capitalize mb-4">
                                    {vehicle.type}
                                </span>
                                <h1 className="text-3xl lg:text-4xl font-bold mb-2">{vehicle.name}</h1>
                                {vehicle.owner && (
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                        <User className="w-4 h-4" />
                                        Listed by {vehicle.owner.name}
                                    </p>
                                )}
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6">
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-4xl font-bold">₹{vehicle.pricePerDay.toLocaleString()}</span>
                                    <span className="text-muted-foreground">/ day</span>
                                </div>

                                <div
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${vehicle.isAvailable
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${vehicle.isAvailable ? "bg-emerald-500" : "bg-red-500"}`} />
                                    {vehicle.isAvailable ? "Available" : "Not Available"}
                                </div>
                            </div>

                            {/* Booking CTA */}
                            <div className="space-y-4">
                                <Link
                                    href={`/vehicles/${vehicle._id}/book`}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    <Calendar className="w-5 h-5" />
                                    Book Now
                                </Link>
                                <p className="text-center text-sm text-muted-foreground">
                                    You won&apos;t be charged yet
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
