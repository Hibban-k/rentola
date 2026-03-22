import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton, { SkeletonPulse } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
    return (
        <DashboardLayout role="provider">
            <PageHeader
                title="Provider Dashboard"
                subtitle="Manage your vehicle listings"
            />
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <SkeletonPulse className="w-12 h-12 rounded-xl shrink-0" />
                            <div className="space-y-2 flex-1">
                                <SkeletonPulse className="h-6 w-1/3" />
                                <SkeletonPulse className="h-4 w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <LoadingSkeleton variant="card" count={3} />
            </div>
        </DashboardLayout>
    );
}
