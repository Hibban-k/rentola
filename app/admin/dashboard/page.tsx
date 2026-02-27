import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, Users, Clock, CheckCircle2, XCircle, Calendar, Car } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import ProviderCard from "@/components/cards/ProviderCard";
import { adminService } from "@/lib/services/admin.service";
import { rentalService } from "@/lib/services/rental.service";
import { getAuthSession } from "@/lib/auth";
import AdminTabs from "./AdminTabs";
import Rental from "@/models/Rental";
import { connectToDatabase } from "@/lib/db";

export default async function AdminDashboardPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const session = await getAuthSession();

    if (!session || session.role !== "admin") {
        redirect("/auth");
    }

    const { status: activeStatus } = await searchParams;
    const activeTab = activeStatus || "pending";

    await connectToDatabase();
    const rawProviders = await adminService.getAllProviders();
    const providers = JSON.parse(JSON.stringify(rawProviders));

    const rentals = await Rental.find({
        status: { $in: ["active", "completed"] }
    }).lean();

    const totalRevenue = rentals.length * 18;

    const tabCounts = {
        pending: providers.filter((p: any) => p.providerStatus === "pending").length,
        approved: providers.filter((p: any) => p.providerStatus === "approved").length,
        rejected: providers.filter((p: any) => p.providerStatus === "rejected").length,
    };

    const filteredProviders = activeTab === "all"
        ? providers
        : providers.filter((p: any) => p.providerStatus === activeTab);

    return (
        <DashboardLayout role="admin">
            <PageHeader
                title="Admin Dashboard"
                subtitle="Manage provider approvals and platform overview"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{providers.length}</p>
                            <p className="text-sm text-muted-foreground">Total Providers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            <Clock className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{tabCounts.pending}</p>
                            <p className="text-sm text-amber-600/70">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">{tabCounts.approved}</p>
                            <p className="text-sm text-emerald-600/70">Approved</p>
                        </div>
                    </div>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-primary">₹{totalRevenue.toLocaleString()}</p>
                            <p className="text-sm text-primary/70">Platform Revenue</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <Link
                    href="/admin/providers"
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                >
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-medium">Providers</span>
                </Link>
                <Link
                    href="/admin/users"
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                >
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-medium">Users</span>
                </Link>
                <Link
                    href="/admin/rentals"
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                >
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-medium">Rentals</span>
                </Link>
                <Link
                    href="/vehicles"
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                >
                    <Car className="w-5 h-5 text-primary" />
                    <span className="font-medium">Vehicles</span>
                </Link>
            </div>

            {/* Provider Approvals Section */}
            <h2 className="text-xl font-bold mb-4">Provider Approvals</h2>

            <AdminTabs activeTab={activeTab} baseUrl="/admin/dashboard" counts={tabCounts} />

            {/* Providers List */}
            {filteredProviders.length === 0 ? (
                <EmptyState
                    icon={<Users className="w-16 h-16 text-muted-foreground" />}
                    title={activeTab === "pending" ? "No pending requests" : `No ${activeTab} providers`}
                    description={activeTab === "pending" ? "No pending approval requests at the moment." : `No ${activeTab} providers.`}
                />
            ) : (
                <div className="space-y-4">
                    {filteredProviders.map((provider: any) => (
                        <ProviderCard
                            key={provider._id}
                            provider={provider}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
