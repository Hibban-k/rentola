import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton, { SkeletonPulse } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
    return (
        <DashboardLayout role="admin">
            <PageHeader
                title="Admin Dashboard"
                subtitle="Manage provider approvals and platform overview"
            />
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <SkeletonPulse className="w-12 h-12 rounded-xl shrink-0" />
                            <div className="space-y-2 flex-1">
                                <SkeletonPulse className="h-6 w-1/2" />
                                <SkeletonPulse className="h-4 w-3/4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Links Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                        <SkeletonPulse className="w-5 h-5 rounded shrink-0" />
                        <SkeletonPulse className="h-5 w-24" />
                    </div>
                ))}
            </div>
            
            <h2 className="text-xl font-bold mb-4">Provider Approvals</h2>
            
            {/* Tabs Skeleton */}
            <div className="flex gap-2 mb-6">
                <SkeletonPulse className="h-10 w-24 rounded-full" />
                <SkeletonPulse className="h-10 w-28 rounded-full" />
                <SkeletonPulse className="h-10 w-28 rounded-full" />
                <SkeletonPulse className="h-10 w-20 rounded-full" />
            </div>
            
            <LoadingSkeleton variant="card" count={3} />
        </DashboardLayout>
    );
}
