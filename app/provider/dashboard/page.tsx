"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Car,
    Bike,
    Plus,
    AlertCircle,
    Clock,
    CheckCircle2,
    Package,
    Calendar,
    DollarSign,
    Eye,
    Edit,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import { providerApi, authApi, Vehicle as BaseVehicle } from "@/lib/apiClient";

interface Vehicle extends BaseVehicle {
    createdAt: string;
}

interface ProviderUser {
    role: string;
    providerStatus: string;
}

export default function ProviderDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<ProviderUser | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authApi.isLoggedIn()) {
            router.push("/auth/signin");
            return;
        }

        // Decode token to get user info
        try {
            const user = authApi.getCurrentUser();
            if (!user || (user.role !== "provider" && user.role !== "admin")) {
                router.push("/dashboard");
                return;
            }
            setUser({ role: user.role, providerStatus: user.providerStatus || "" });
        } catch {
            router.push("/auth/signin");
            return;
        }

        fetchVehicles();
    }, [router]);

    const fetchVehicles = async () => {
        try {
            const { data, error: apiError } = await providerApi.getVehicles();

            if (apiError) {
                if (apiError === "Network error") {
                    authApi.logout();
                    router.push("/auth/signin");
                    return;
                }
                throw new Error(apiError);
            }

            setVehicles((data?.vehicles as Vehicle[]) || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load vehicles");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAvailability = async (vehicleId: string, currentStatus: boolean) => {
        try {
            const { error: apiError } = await providerApi.updateVehicle(vehicleId, {
                isAvailable: !currentStatus,
            });

            if (!apiError) {
                setVehicles((prev) =>
                    prev.map((v) =>
                        v._id === vehicleId ? { ...v, isAvailable: !currentStatus } : v
                    )
                );
            }
        } catch (err) {
            console.error("Failed to toggle availability:", err);
        }
    };

    const isPending = user?.providerStatus === "pending";
    const isRejected = user?.providerStatus === "rejected";

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
                            <p className="text-muted-foreground">Manage your vehicle listings</p>
                        </div>
                        {!isPending && !isRejected && (
                            <Link
                                href="/provider/vehicles/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Vehicle
                            </Link>
                        )}
                    </div>

                    {/* Pending Approval Notice */}
                    {isPending && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <Clock className="w-8 h-8 text-amber-500 shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-2">
                                        Account Pending Approval
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Your provider account is under review. Once approved by an admin, you&apos;ll be able to add and manage vehicles.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rejected Notice */}
                    {isRejected && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                                        Account Rejected
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Your provider application was not approved. Please contact support for more information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    {!isPending && !isRejected && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <Package className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{vehicles.length}</p>
                                        <p className="text-sm text-muted-foreground">Total Vehicles</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {vehicles.filter((v) => v.isAvailable).length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Available</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-xl">
                                        <Calendar className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {vehicles.filter((v) => !v.isAvailable).length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Unavailable</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vehicles List */}
                    {!isPending && !isRejected && (
                        <>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                                            <div className="flex gap-4">
                                                <div className="w-32 h-24 bg-muted rounded-xl" />
                                                <div className="flex-1 space-y-3">
                                                    <div className="h-5 bg-muted rounded w-1/3" />
                                                    <div className="h-4 bg-muted rounded w-1/4" />
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
                            ) : vehicles.length === 0 ? (
                                <div className="text-center py-16 bg-card border border-border rounded-2xl">
                                    <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">No vehicles listed</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Start by adding your first vehicle to the platform.
                                    </p>
                                    <Link
                                        href="/provider/vehicles/new"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Your First Vehicle
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {vehicles.map((vehicle) => (
                                        <div
                                            key={vehicle._id}
                                            className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Vehicle Image */}
                                                <div className="relative w-full md:w-40 h-32 bg-muted rounded-xl overflow-hidden shrink-0">
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
                                                                <Car className="w-10 h-10 text-muted-foreground" />
                                                            ) : (
                                                                <Bike className="w-10 h-10 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                        <div>
                                                            <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                                                            <p className="text-sm text-muted-foreground capitalize">
                                                                {vehicle.type} · {vehicle.licensePlate}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleAvailability(vehicle._id, vehicle.isAvailable)}
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${vehicle.isAvailable
                                                                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                                    }`}
                                                            >
                                                                {vehicle.isAvailable ? (
                                                                    <ToggleRight className="w-4 h-4" />
                                                                ) : (
                                                                    <ToggleLeft className="w-4 h-4" />
                                                                )}
                                                                {vehicle.isAvailable ? "Available" : "Unavailable"}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-3">
                                                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-semibold">₹{vehicle.pricePerDay.toLocaleString()}</span>
                                                        <span className="text-muted-foreground">/day</span>
                                                    </div>

                                                    <div className="flex gap-2 mt-4">
                                                        <Link
                                                            href={`/vehicles/${vehicle._id}`}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={`/provider/vehicles/${vehicle._id}/edit`}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
