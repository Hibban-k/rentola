"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Car, Bike, Filter, X } from "lucide-react";
import { vehiclesApi, Vehicle } from "@/lib/apiClient";

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "car" | "bike">("all");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setPage(1);
        setVehicles([]);
        fetchVehicles(1, true);
    }, [typeFilter]);

    const fetchVehicles = async (pageNum: number, isInitial: boolean = false) => {
        if (isInitial) setIsLoading(true);
        else setIsMoreLoading(true);
        setError(null);

        try {
            const filters: { type?: "car" | "bike"; search?: string; page: number; limit: number } = {
                page: pageNum,
                limit: 12
            };
            if (typeFilter !== "all") filters.type = typeFilter;
            if (searchQuery) filters.search = searchQuery;

            const { data, error: apiError } = await vehiclesApi.list(filters);

            if (apiError) throw new Error(apiError);

            if (isInitial) {
                setVehicles(data?.vehicles || []);
            } else {
                setVehicles(prev => [...prev, ...(data?.vehicles || [])]);
            }

            setHasMore(data?.pagination ? data.pagination.page < data.pagination.totalPages : false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load vehicles");
        } finally {
            setIsLoading(false);
            setIsMoreLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchVehicles(nextPage);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setVehicles([]);
        fetchVehicles(1, true);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Hero Banner */}
            <div className="pt-24 pb-12 bg-gradient-to-b from-primary/5 to-background">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold text-center mb-4">Browse Vehicles</h1>
                    <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
                        Explore our curated selection of premium vehicles. Filter by type or search for your perfect ride.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search vehicles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="p-3 border border-input rounded-xl hover:bg-muted transition-colors md:hidden"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden md:block w-64 shrink-0">
                        <div className="sticky top-24 bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-semibold mb-4">Filters</h3>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground mb-2">Vehicle Type</p>
                                {(["all", "car", "bike"] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setTypeFilter(type)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${typeFilter === type
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                            }`}
                                    >
                                        {type === "car" && <Car className="w-4 h-4" />}
                                        {type === "bike" && <Bike className="w-4 h-4" />}
                                        {type === "all" && <Filter className="w-4 h-4" />}
                                        <span className="capitalize">{type === "all" ? "All Types" : type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Filters Drawer */}
                    {showFilters && (
                        <div className="fixed inset-0 z-50 md:hidden">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                            <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 animate-in slide-in-from-bottom">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">Filters</h3>
                                    <button onClick={() => setShowFilters(false)}>
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {(["all", "car", "bike"] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setTypeFilter(type);
                                                setShowFilters(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${typeFilter === type
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted border border-border"
                                                }`}
                                        >
                                            {type === "car" && <Car className="w-5 h-5" />}
                                            {type === "bike" && <Bike className="w-5 h-5" />}
                                            {type === "all" && <Filter className="w-5 h-5" />}
                                            <span className="capitalize">{type === "all" ? "All Types" : type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vehicle Grid */}
                    <main className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                                        <div className="aspect-video bg-muted" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-5 bg-muted rounded w-2/3" />
                                            <div className="h-4 bg-muted rounded w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <p className="text-destructive">{error}</p>
                            </div>
                        ) : vehicles.length === 0 ? (
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
                                            <div className="relative aspect-video bg-muted overflow-hidden">
                                                {vehicle.vehicleImageUrl && vehicle.vehicleImageUrl.length > 0 ? (
                                                    <Image
                                                        src={vehicle.vehicleImageUrl[0].url}
                                                        alt={vehicle.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        {vehicle.type === "car" ? (
                                                            <Car className="w-12 h-12 text-muted-foreground" />
                                                        ) : (
                                                            <Bike className="w-12 h-12 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-2 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-full capitalize">
                                                        {vehicle.type}
                                                    </span>
                                                </div>
                                            </div>

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

                                {/* Load More */}
                                {hasMore && (
                                    <div className="mt-12 flex justify-center">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isMoreLoading}
                                            className="px-8 py-3 bg-card border border-border rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50"
                                        >
                                            {isMoreLoading ? "Loading..." : "Load More Vehicles"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}
