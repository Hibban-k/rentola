import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function Loading() {
    return (
        <DashboardLayout role="provider">
            <PageHeader
                title="Loading Vehicles"
                subtitle="Fetching your vehicle listings..."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <LoadingSkeleton variant="card" count={6} />
            </div>
        </DashboardLayout>
    );
}
