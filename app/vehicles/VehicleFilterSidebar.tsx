"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Car, Bike, Filter, X } from "lucide-react";
import { useState } from "react";
import CalendarPicker from "@/components/ui/CalendarPicker";

interface VehicleFiltersProps {
    currentType: string;
    currentSearch: string;
    children?: React.ReactNode;
}

export default function VehicleFilterSidebar({ currentType, currentSearch, children }: VehicleFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(currentSearch);
    const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
    const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
    const [showFilters, setShowFilters] = useState(false);

    const updateUrl = (type?: string, search?: string, start?: string, end?: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (type !== undefined) {
            if (type === "all") params.delete("type");
            else params.set("type", type);
        }

        if (search !== undefined) {
            if (!search) params.delete("search");
            else params.set("search", search);
        }
        
        if (start !== undefined) {
            if (!start) params.delete("startDate");
            else params.set("startDate", start);
        }
        
        if (end !== undefined) {
            if (!end) params.delete("endDate");
            else params.set("endDate", end);
        }

        // Reset page on filter change
        params.delete("page");

        router.push(`/vehicles?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateUrl(undefined, searchQuery, startDate, endDate);
    };

    const types = [
        { id: "all", label: "All Types", icon: Filter },
        { id: "car", label: "Car", icon: Car },
        { id: "bike", label: "Bike", icon: Bike },
    ];

    return (
        <div className="w-full">
            {/* Search Bar - Positioned carefully to overlap the hero or sit below it */}
            <div className="container mx-auto px-4 -mt-6 relative z-10 mb-8">
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3 p-2 bg-background/80 backdrop-blur-xl border border-border shadow-lg rounded-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search vehicles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent focus:outline-none focus:ring-0 text-foreground transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg transition-all active:scale-[0.98]"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="p-3 bg-secondary/50 border border-border rounded-xl hover:bg-secondary transition-colors md:hidden"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="container mx-auto px-4 pb-16">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-72 shrink-0">
                        <div className="sticky top-24 bg-card/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden group">
                            {/* Subtle background glow effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-700 group-hover:bg-primary/10"></div>
                            
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-inner">
                                    <Filter className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">Filters</h3>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            Dates
                                        </h4>
                                    </div>
                                    <div className="space-y-4">
                                        <CalendarPicker
                                            label="Pick-up"
                                            selectedDate={startDate}
                                            onDateSelect={(date) => {
                                                setStartDate(date);
                                                updateUrl(undefined, undefined, date, endDate);
                                            }}
                                            minDate={new Date().toISOString().split('T')[0]} // prevent past dates
                                            placeholder="Start date"
                                        />
                                        <CalendarPicker
                                            label="Drop-off"
                                            selectedDate={endDate}
                                            onDateSelect={(date) => {
                                                setEndDate(date);
                                                updateUrl(undefined, undefined, startDate, date);
                                            }}
                                            minDate={startDate || new Date().toISOString().split('T')[0]}
                                            placeholder="End date"
                                        />
                                    </div>
                                </div>
                                
                                <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />

                                <div className="space-y-5">
                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Vehicle Type</h4>
                                    <div className="flex flex-col gap-2">
                                        {types.map((type) => {
                                            const Icon = type.icon;
                                            const isActive = currentType === type.id;
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => updateUrl(type.id, undefined, startDate, endDate)}
                                                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group/btn
                                                        ${isActive
                                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                                                        : "hover:bg-muted font-medium text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    {isActive && (
                                                        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out"></div>
                                                    )}
                                                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover/btn:scale-110'}`} />
                                                    <span className="capitalize relative z-10">{type.label}</span>
                                                    {isActive && (
                                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Filters Drawer */}
                    {showFilters && (
                        <div className="fixed inset-0 z-50 md:hidden">
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
                            <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto bg-card border-t border-border rounded-t-[2.5rem] p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
                                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold tracking-tight">Filters</h3>
                                    <button onClick={() => setShowFilters(false)} className="p-2.5 bg-secondary/50 hover:bg-secondary rounded-full transition-colors active:scale-95">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-5">
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Date Range</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <CalendarPicker
                                                label="Pick-up"
                                                selectedDate={startDate}
                                                onDateSelect={(date) => {
                                                    setStartDate(date);
                                                    updateUrl(undefined, undefined, date, endDate);
                                                }}
                                                minDate={new Date().toISOString().split('T')[0]} // prevent past dates
                                                placeholder="Start date"
                                            />
                                            <CalendarPicker
                                                label="Drop-off"
                                                selectedDate={endDate}
                                                onDateSelect={(date) => {
                                                    setEndDate(date);
                                                    updateUrl(undefined, undefined, startDate, date);
                                                }}
                                                minDate={startDate || new Date().toISOString().split('T')[0]}
                                                placeholder="End date"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="h-px bg-border" />

                                    <div className="space-y-5">
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Vehicle Type</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {types.map((type) => {
                                                const Icon = type.icon;
                                                const isActive = currentType === type.id;
                                                return (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => {
                                                            updateUrl(type.id, undefined, startDate, endDate);
                                                            setShowFilters(false);
                                                        }}
                                                        className={`w-full flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all duration-300 ${isActive
                                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border border-primary"
                                                            : "bg-background border border-border hover:bg-card hover:border-primary/30 font-medium text-muted-foreground"
                                                            }`}
                                                    >
                                                        <Icon className="w-6 h-6" />
                                                        <span className="capitalize">{type.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ensure children render exactly side-by-side with sidebar */}
                    {children}
                </div>
            </div>
        </div>
    );
}
