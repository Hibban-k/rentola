import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton, { SkeletonPulse } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
    return (
        <DashboardLayout role="provider">
            <PageHeader
                title="Bookings"
                subtitle="Manage your vehicle bookings"
            />

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                    <SkeletonPulse className="h-8 w-12" />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-sm text-amber-600/70 mb-1">Pending</p>
                    <SkeletonPulse className="h-8 w-12" />
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-sm text-emerald-600/70 mb-1">Active</p>
                    <SkeletonPulse className="h-8 w-12" />
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm text-blue-600/70 mb-1">Completed</p>
                    <SkeletonPulse className="h-8 w-12" />
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-2 mb-6">
                <SkeletonPulse className="h-10 w-16 rounded-full" />
                <SkeletonPulse className="h-10 w-24 rounded-full" />
                <SkeletonPulse className="h-10 w-24 rounded-full" />
                <SkeletonPulse className="h-10 w-28 rounded-full" />
                <SkeletonPulse className="h-10 w-28 rounded-full" />
            </div>

            {/* Bookings List Skeleton */}
            <LoadingSkeleton variant="card" count={4} />
        </DashboardLayout>
    );
}
