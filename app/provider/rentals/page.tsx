"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Calendar,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Car,
    Bike,
    Loader2,
    IndianRupee,
    User,
} from "lucide-react";
import { providerApi, Rental } from "@/lib/apiClient";

export default function ProviderBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | Rental["status"]>("all");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/auth");
            return;
        }

        if (session?.user?.role !== "provider") {
            router.push("/unauthorized");
            return;
        }

        fetchBookings();
    }, [router, status, session]);

    const fetchBookings = async () => {
        setIsLoading(true);
        setError(null);

        const response = await providerApi.getRentals();

        if (response.error) {
            if (response.error !== "No rentals found" && response.error !== "No vehicles found") {
                setError(response.error);
            }
            setBookings([]);
        } else if (response.data) {
            setBookings(response.data);
        }

        setIsLoading(false);
    };

    const handleStatusUpdate = async (bookingId: string, newStatus: Rental["status"]) => {
        setUpdatingId(bookingId);

        const response = await providerApi.updateRentalStatus(bookingId, newStatus);

        if (response.error) {
            setError(response.error);
        } else if (response.data) {
            setBookings(prev =>
                prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b)
            );
        }

        setUpdatingId(null);
    };

    const filteredBookings = filter === "all"
        ? bookings
        : bookings.filter(b => b.status === filter);

    const getStatusColor = (status: Rental["status"]) => {
        switch (status) {
            case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            case "active": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "completed": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20";
            default: return "bg-muted text-muted-foreground";
        }
    };

    const getStatusIcon = (status: Rental["status"]) => {
        switch (status) {
            case "pending": return <Clock className="w-4 h-4" />;
            case "active": return <CheckCircle className="w-4 h-4" />;
            case "completed": return <CheckCircle className="w-4 h-4" />;
            case "cancelled": return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === "pending").length,
        active: bookings.filter(b => b.status === "active").length,
        completed: bookings.filter(b => b.status === "completed").length,
    };

    if (isLoading) {
        return (
            <DashboardLayout role="provider">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="provider">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Bookings</h1>
                    <p className="text-muted-foreground">Manage your vehicle bookings</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-sm text-yellow-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-600 mb-1">Active</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm text-blue-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(["all", "pending", "active", "completed", "cancelled"] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === status
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status !== "all" && (
                            <span className="ml-2 opacity-70">
                                ({bookings.filter(b => b.status === status).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                    <p className="text-muted-foreground">
                        {filter === "all"
                            ? "You haven't received any bookings yet."
                            : `No ${filter} bookings found.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Vehicle Image */}
                                <div className="w-full lg:w-48 h-32 relative rounded-xl overflow-hidden bg-muted shrink-0">
                                    {booking.vehicleId?.vehicleImageUrl?.[0]?.url ? (
                                        <Image
                                            src={booking.vehicleId.vehicleImageUrl[0].url}
                                            alt={booking.vehicleId.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {booking.vehicleId?.type === "bike" ? (
                                                <Bike className="w-12 h-12 text-muted-foreground" />
                                            ) : (
                                                <Car className="w-12 h-12 text-muted-foreground" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {booking.vehicleId?.name || "Unknown Vehicle"}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.vehicleId?.licensePlate}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4 shrink-0" />
                                            <span>
                                                {formatDate(booking.rentalPeriod.startDate)} - {formatDate(booking.rentalPeriod.endDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{booking.pickupLocation}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 shrink-0 text-green-600" />
                                            <span className="font-semibold text-green-600">₹{booking.totalCost.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {booking.status === "pending" && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleStatusUpdate(booking._id, "active")}
                                                disabled={updatingId === booking._id}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all"
                                            >
                                                {updatingId === booking._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                                                disabled={updatingId === booking._id}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all"
                                            >
                                                {updatingId === booking._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="w-4 h-4" />
                                                )}
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {booking.status === "active" && (
                                        <button
                                            onClick={() => handleStatusUpdate(booking._id, "completed")}
                                            disabled={updatingId === booking._id}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                                        >
                                            {updatingId === booking._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Mark Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
