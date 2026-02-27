import { redirect } from "next/navigation";
import { Car } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import RentalCard from "@/components/cards/RentalCard";
import { rentalService } from "@/lib/services/rental.service";
import { getAuthSession } from "@/lib/auth";
import RentalTabs from "./RentalTabs";
import { Rental } from "@/lib/apiClient";

export default async function UserRentalsPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const session = await getAuthSession();
    if (!session) {
        redirect("/auth");
    }

    const { status: activeStatus } = await searchParams;
    const activeTab = activeStatus || "all";

    const rawRentals = await rentalService.getUserRentals(session.id!);
    const rentals = JSON.parse(JSON.stringify(rawRentals)) as Rental[];

    const tabCounts = {
        pending: rentals.filter((r) => r.status === "pending").length,
        active: rentals.filter((r) => r.status === "active").length,
        completed: rentals.filter((r) => r.status === "completed").length,
        cancelled: rentals.filter((r) => r.status === "cancelled").length,
    };

    const filteredRentals = activeTab === "all"
        ? rentals
        : rentals.filter((r) => r.status === activeTab);

    return (
        <DashboardLayout role="user">
            <PageHeader
                title="All Rentals"
                subtitle="View all your rental history"
            />

            <RentalTabs activeTab={activeTab} baseUrl="/user/rentals" counts={tabCounts} />

            {/* Content */}
            {filteredRentals.length === 0 ? (
                <EmptyState
                    icon={<Car className="w-16 h-16 text-muted-foreground" />}
                    title={activeTab === "all" ? "No rentals yet" : `No ${activeTab} rentals`}
                    description={
                        activeTab === "all"
                            ? "Start exploring vehicles to book your first ride!"
                            : "Check other tabs for your bookings."
                    }
                    actionLabel={activeTab === "all" ? "Browse Vehicles" : undefined}
                    actionHref={activeTab === "all" ? "/vehicles" : undefined}
                />
            ) : (
                <div className="space-y-4">
                    {filteredRentals.map((rental) => (
                        <RentalCard key={rental._id} rental={rental} variant="user" />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
