import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, Plus, Package, CheckCircle2, Calendar } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import VehicleCard from "@/components/cards/VehicleCard";
import { vehicleService } from "@/lib/services/vehicle.service";
import { rentalService } from "@/lib/services/rental.service";
import { getProviderSession } from "@/lib/auth";
import { Vehicle, Rental } from "@/lib/apiClient";
import { connectToDatabase } from "@/lib/db";
import RentalModel from "@/models/Rental";

export default async function ProviderDashboardPage() {
    const session = await getProviderSession().catch(() => null);

    if (!session) {
        redirect("/auth");
    }

    if (session.providerStatus === "pending" || session.providerStatus === "rejected") {
        redirect("/provider/pending");
    }

    const rawVehicles = await vehicleService.getProviderVehicles(session.id!);
    const vehicles = JSON.parse(JSON.stringify(rawVehicles)) as Vehicle[];

    await connectToDatabase();
    const vehicleIds = vehicles.map(v => v._id);
    const providerRentals = await RentalModel.find({
        vehicleId: { $in: vehicleIds },
        status: { $in: ["active", "completed"] }
    }).lean();

    const totalEarnings = providerRentals.reduce((sum, r) => sum + (r.totalCost - 18), 0);

    const availableCount = vehicles.filter((v) => v.isAvailable).length;
    const unavailableCount = vehicles.filter((v) => !v.isAvailable).length;

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
                            <p className="text-2xl font-bold">{availableCount}</p>
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
                            <p className="text-2xl font-bold">{unavailableCount}</p>
                            <p className="text-sm text-muted-foreground">Unavailable</p>
                        </div>
                    </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">₹{totalEarnings.toLocaleString()}</p>
                            <p className="text-sm text-emerald-600/70">Total Earnings</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicles List */}
            {vehicles.length === 0 ? (
                <EmptyState
                    icon={<Car className="w-16 h-16 text-muted-foreground" />}
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
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
