import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, Plus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import VehicleCard from "@/components/cards/VehicleCard";
import { vehicleService } from "@/lib/services/vehicle.service";
import { getProviderSession } from "@/lib/auth";
import { Vehicle } from "@/types";

export const metadata = {
    title: "My Vehicles | Rentola Provider",
    description: "Manage your listed vehicles on Rentola",
};

export default async function ProviderVehiclesPage() {
    const session = await getProviderSession();

    if (!session) {
        redirect("/auth");
    }

    if (session.providerStatus === "pending" || session.providerStatus === "rejected") {
        redirect("/provider/pending");
    }

    // Server Component data fetching
    const rawVehicles = await vehicleService.getProviderVehicles(session.id!);
    const vehicles = JSON.parse(JSON.stringify(rawVehicles)) as Vehicle[];

    return (
        <DashboardLayout role="provider">
            <PageHeader
                title="My Vehicles"
                subtitle="View and manage all your listed vehicles"
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

            {/* Vehicles List */}
            {vehicles.length === 0 ? (
                <EmptyState
                    icon={<Car className="w-16 h-16 text-muted-foreground" />}
                    title="No vehicles listed"
                    description="You haven't added any vehicles yet. Start by listing your first vehicle."
                    actionLabel="Add Your First Vehicle"
                    actionHref="/provider/vehicles/create"
                />
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
