"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Plus, Package, CheckCircle2, Calendar } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import VehicleCard from "@/components/cards/VehicleCard";
import { providerApi, Vehicle } from "@/lib/apiClient";

export default function ProviderDashboardPage() {
    const router = useRouter();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [providerStatus, setProviderStatus] = useState<string>("");

    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/auth");
            return;
        }

        if (session?.user?.role !== "provider" && session?.user?.role !== "admin") {
            router.push("/unauthorized");
            return;
        }

        setProviderStatus(session.user.providerStatus || "");

        if (session.user.providerStatus === "pending" || session.user.providerStatus === "rejected") {
            router.push("/provider/pending");
            return;
        }

        fetchVehicles();
    }, [router, status, session]);

    const fetchVehicles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await providerApi.getVehicles();

            if (apiError) {
                throw new Error(apiError);
            }

            setVehicles((data?.vehicles as Vehicle[]) || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load vehicles");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAvailability = async (vehicleId: string, isAvailable: boolean) => {
        try {
            const { error: apiError } = await providerApi.updateVehicle(vehicleId, {
                isAvailable: !isAvailable,
            });

            if (!apiError) {
                setVehicles((prev) =>
                    prev.map((v) =>
                        v._id === vehicleId ? { ...v, isAvailable: !isAvailable } : v
                    )
                );
            }
        } catch (err) {
            console.error("Failed to toggle availability:", err);
        }
    };

    const handleDeleteVehicle = async (vehicleId: string) => {
        const { error: apiError } = await providerApi.deleteVehicle(vehicleId);
        if (!apiError) {
            setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
        }
    };

    return (
        <DashboardLayout role="provider">
            <PageHeader
                title="Provider Dashboard"
                subtitle="Manage your vehicle listings"
                actions={
                    <Link
                        href="/provider/vehicles/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Vehicle
                    </Link>
                }
            />

            {/* Stats Cards */}
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

            {/* Vehicles List */}
            {isLoading ? (
                <LoadingSkeleton variant="card" count={3} />
            ) : error ? (
                <ErrorState message={error} onRetry={fetchVehicles} />
            ) : vehicles.length === 0 ? (
                <EmptyState
                    icon={Car}
                    title="No vehicles listed"
                    description="Start by adding your first vehicle to the platform."
                    actionLabel="Add Your First Vehicle"
                    actionHref="/provider/vehicles/create"
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {vehicles.map((vehicle) => (
                        <VehicleCard
                            key={vehicle._id}
                            vehicle={vehicle}
                            variant="provider"
                            onToggleAvailability={() => handleToggleAvailability(vehicle._id, vehicle.isAvailable)}
                            onDelete={() => handleDeleteVehicle(vehicle._id)}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
