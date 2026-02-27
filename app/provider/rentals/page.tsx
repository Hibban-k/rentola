import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import RentalCard from "@/components/cards/RentalCard";
import { rentalService } from "@/lib/services/rental.service";
import { getAuthSession } from "@/lib/auth";
import { Calendar } from "lucide-react";
import RentalTabs from "../../user/rentals/RentalTabs";

export default async function ProviderBookingsPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const session = await getAuthSession();

    if (!session || session.role !== "provider") {
        redirect("/auth");
    }

    if (session.providerStatus !== "approved") {
        redirect("/provider/pending");
    }

    const { status: activeStatus } = await searchParams;
    const activeTab = activeStatus || "all";

    const rawBookings = await rentalService.getProviderRentals(session.id!);
    const bookings = JSON.parse(JSON.stringify(rawBookings));

    const tabCounts = {
        pending: bookings.filter((b: any) => b.status === "pending").length,
        active: bookings.filter((b: any) => b.status === "active").length,
        completed: bookings.filter((b: any) => b.status === "completed").length,
        cancelled: bookings.filter((b: any) => b.status === "cancelled").length,
    };

    const filteredBookings = activeTab === "all"
        ? bookings
        : bookings.filter((b: any) => b.status === activeTab);

    return (
        <DashboardLayout role="provider">
            <PageHeader
                title="Bookings"
                subtitle="Manage your vehicle bookings"
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-sm text-amber-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{tabCounts.pending}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-sm text-emerald-600 mb-1">Active</p>
                    <p className="text-2xl font-bold text-emerald-600">{tabCounts.active}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm text-blue-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{tabCounts.completed}</p>
                </div>
            </div>

            <RentalTabs activeTab={activeTab} baseUrl="/provider/rentals" counts={tabCounts} />

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <EmptyState
                    icon={<Calendar className="w-16 h-16 text-muted-foreground" />}
                    title="No bookings found"
                    description={activeTab === "all" ? "You haven't received any bookings yet." : `No ${activeTab} bookings found.`}
                />
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking: any) => (
                        <RentalCard
                            key={booking._id}
                            rental={booking}
                            variant="provider"
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
