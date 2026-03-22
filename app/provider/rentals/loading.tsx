import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function Loading() {
    return (
        <DashboardLayout role="provider">
            <PageHeader
                title="Loading Rentals"
                subtitle="Fetching your rental history..."
            />
            <LoadingSkeleton variant="list" count={5} />
        </DashboardLayout>
    );
}
