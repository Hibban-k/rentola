"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Car, Bike, Filter, X } from "lucide-react";
import { useState } from "react";

interface VehicleFiltersProps {
    currentType: string;
    currentSearch: string;
}

export default function VehicleFilterSidebar({ currentType, currentSearch }: VehicleFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(currentSearch);
    const [showFilters, setShowFilters] = useState(false);

    const updateUrl = (type?: string, search?: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (type !== undefined) {
            if (type === "all") params.delete("type");
            else params.set("type", type);
        }

        if (search !== undefined) {
            if (!search) params.delete("search");
            else params.set("search", search);
        }

        // Reset page on filter change
        params.delete("page");

        router.push(`/vehicles?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateUrl(undefined, searchQuery);
    };

    const types = [
        { id: "all", label: "All Types", icon: Filter },
        { id: "car", label: "Car", icon: Car },
        { id: "bike", label: "Bike", icon: Bike },
    ];

    return (
        <>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
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
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 sm:flex-none px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
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
                </div>
            </form>

            <div className="flex gap-8">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-64 shrink-0">
                    <div className="sticky top-24 bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-semibold mb-4">Filters</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground mb-2">Vehicle Type</p>
                            {types.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => updateUrl(type.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentType === type.id
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="capitalize">{type.label}</span>
                                    </button>
                                );
                            })}
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
                                {types.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                updateUrl(type.id);
                                                setShowFilters(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${currentType === type.id
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted border border-border"
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="capitalize">{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
