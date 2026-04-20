import { redirect } from "next/navigation";
import { Car } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import RentalCard from "@/components/cards/RentalCard";
import { rentalService } from "@/lib/services/rental.service";
import { getAuthSession } from "@/lib/auth";
import RentalTabs from "./RentalTabs";
import { Rental } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
        pending: rentals.filter((r) => r.status === "pending" || r.status === "hold").length,
        active: rentals.filter((r) => r.status === "active").length,
        completed: rentals.filter((r) => r.status === "completed").length,
        cancelled: rentals.filter((r) => r.status === "cancelled" || r.status === "failed").length,
    };

    const filteredRentals = activeTab === "all"
        ? rentals
        : activeTab === "pending"
            ? rentals.filter((r) => r.status === "pending" || r.status === "hold")
            : activeTab === "cancelled"
                ? rentals.filter((r) => r.status === "cancelled" || r.status === "failed")
                : rentals.filter((r) => r.status === activeTab);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-32 pb-16 max-w-5xl">
                <PageHeader
                    title="My Rentals"
                    subtitle="View all your rental history and active bookings"
                />

                <RentalTabs activeTab={activeTab} baseUrl="/user/rentals" counts={tabCounts} />

                {/* Content */}
                {filteredRentals.length === 0 ? (
                    <div className="mt-8">
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
                    </div>
                ) : (
                    <div className="space-y-4 mt-8">
                        {filteredRentals.map((rental) => (
                            <RentalCard key={rental._id} rental={rental} variant="user" />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
