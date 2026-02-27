import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import ProviderCard from "@/components/cards/ProviderCard";
import { adminService } from "@/lib/services/admin.service";
import { getAuthSession } from "@/lib/auth";
import { Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import AdminTabs from "../dashboard/AdminTabs";

export default async function AdminProvidersPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const session = await getAuthSession();

    if (!session || session.role !== "admin") {
        redirect("/auth");
    }

    const { status: activeStatus } = await searchParams;
    const activeTab = activeStatus || "all";

    const rawProviders = await adminService.getAllProviders();
    const providers = JSON.parse(JSON.stringify(rawProviders));

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
                title="Providers"
                subtitle="Manage provider applications and accounts"
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-muted-foreground text-sm">Total</p>
                    <p className="text-2xl font-bold">{providers.length}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-500 text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        Pending
                    </div>
                    <p className="text-2xl font-bold text-amber-500">{tabCounts.pending}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-500 text-sm mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Approved
                    </div>
                    <p className="text-2xl font-bold text-emerald-500">{tabCounts.approved}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
                        <XCircle className="w-4 h-4" />
                        Rejected
                    </div>
                    <p className="text-2xl font-bold text-red-500">{tabCounts.rejected}</p>
                </div>
            </div>

            <AdminTabs activeTab={activeTab} baseUrl="/admin/providers" counts={tabCounts} />

            {/* Content */}
            {filteredProviders.length === 0 ? (
                <EmptyState
                    icon={<Users className="w-16 h-16 text-muted-foreground" />}
                    title={activeTab === "all" ? "No providers yet" : `No ${activeTab} providers`}
                    description="Provider applications will appear here."
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
