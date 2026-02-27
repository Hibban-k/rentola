import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Car, Bike } from "lucide-react";
import { vehicleService } from "@/lib/services/vehicle.service";
import VehicleFilterSidebar from "./VehicleFilterSidebar";
import LoadMore from "./LoadMore";
import { Vehicle } from "@/lib/apiClient";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

export default async function VehiclesPage({
    searchParams
}: {
    searchParams: Promise<{ type?: string; search?: string; page?: string }>
}) {
    const filters = await searchParams;
    const page = parseInt(filters.page || "1", 10);
    const limit = 12 * page; // For this specific simple pagination refactor, we just increase limit

    const rawData = await vehicleService.getAllVehicles({
        type: filters.type as any,
        search: filters.search
    });

    // In a real paginated app, we'd use skip/limit in service
    // For now, let's keep it simple to match previous UI behavior
    const allVehicles = JSON.parse(JSON.stringify(rawData)) as Vehicle[];
    const vehicles = allVehicles.slice(0, limit);
    const hasMore = allVehicles.length > limit;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Hero Banner */}
            <div className="pt-24 pb-12 bg-linear-to-b from-primary/5 to-background">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Browse Vehicles</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                        Explore our curated selection of premium vehicles. Filter by type or search for your perfect ride.
                    </p>

                    <VehicleFilterSidebar
                        currentType={filters.type || "all"}
                        currentSearch={filters.search || ""}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* The sidebar is rendered inside VehicleFilterSidebar for layout reasons */}
                    <main className="flex-1">
                        {vehicles.length === 0 ? (
                            <div className="text-center py-12">
                                <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {vehicles.map((vehicle) => (
                                        <Link
                                            key={vehicle._id}
                                            href={`/vehicles/${vehicle._id}`}
                                            className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
                                        >
                                            {/* Image */}
                                            <ResponsiveImage
                                                src={vehicle.vehicleImageUrl?.[0]?.url || ""}
                                                alt={vehicle.name}
                                                fallbackType={vehicle.type === "car" ? "car" : "bike"}
                                                aspectRatio="video"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />

                                            {/* Content */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                                    {vehicle.name}
                                                </h3>
                                                <p className="text-primary font-bold">
                                                    ₹{vehicle.pricePerDay.toLocaleString()}
                                                    <span className="text-muted-foreground font-normal text-sm"> /day</span>
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                <LoadMore hasMore={hasMore} currentPage={page} />
                            </>
                        )}
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}
