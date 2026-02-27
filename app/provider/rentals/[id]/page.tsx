import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Car, Calendar, MapPin, User, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge, { StatusType } from "@/components/ui/StatusBadge";
import { getAuthSession } from "@/lib/auth";
import { rentalService } from "@/lib/services/rental.service";
import RentalStatusActions from "./RentalStatusActions";

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default async function ProviderRentalDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const session = await getAuthSession();

    if (!session || session.role !== "provider") {
        redirect("/auth");
    }

    if (session.providerStatus !== "approved") {
        redirect("/provider/pending");
    }

    let rental;
    try {
        const rawRental = await rentalService.getRentalById(id);
        rental = JSON.parse(JSON.stringify(rawRental));
    } catch (err) {
        redirect("/provider/rentals");
    }

    if (!rental) {
        redirect("/provider/rentals");
    }

    const vehicle = rental.vehicleId;

    return (
        <DashboardLayout role="provider">
            <PageHeader
                title="Rental Details"
                subtitle="View and manage this booking"
                actions={
                    <Link
                        href="/provider/rentals"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Rentals
                    </Link>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Vehicle Card */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="relative h-64 bg-muted">
                            {vehicle?.vehicleImageUrl?.[0]?.url ? (
                                <Image
                                    src={vehicle.vehicleImageUrl[0].url}
                                    alt={vehicle.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Car className="w-16 h-16 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{vehicle?.name || "Vehicle"}</h2>
                                    <p className="text-muted-foreground capitalize">{vehicle?.type}</p>
                                </div>
                                <StatusBadge status={rental.status as StatusType} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Rental Period</p>
                                        <p className="font-medium">
                                            {formatDate(rental.rentalPeriod.startDate)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">to</p>
                                        <p className="font-medium">
                                            {formatDate(rental.rentalPeriod.endDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pickup & Return Station</p>
                                        <p className="font-medium">{vehicle?.pickupStation || "Fixed Pickup Station"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Renter Info */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Renter Information
                        </h3>
                        <div className="space-y-4">
                            {typeof rental.renterId === 'string' ? (
                                <div className="p-4 bg-muted/50 rounded-xl">
                                    <p className="text-sm text-muted-foreground">Renter ID</p>
                                    <p className="font-mono text-sm">{rental.renterId}</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="p-4 bg-muted/50 rounded-xl">
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{rental.renterId.name || "N/A"}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl">
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium truncate" title={rental.renterId.email}>{rental.renterId.email || "N/A"}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl sm:col-span-2">
                                        <p className="text-sm text-muted-foreground">Renter ID</p>
                                        <p className="font-mono text-sm">{rental.renterId._id}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Price Summary */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-semibold mb-4">Booking Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Rental Amount (Paid by renter)</span>
                                <span>₹{rental.totalCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-amber-600">
                                <span>Platform Fee</span>
                                <span>-₹18</span>
                            </div>
                            <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                                <span>Final Earnings</span>
                                <span className="text-primary">₹{(rental.totalCost - 18).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {rental.status === "pending" && (
                        <RentalStatusActions rentalId={rental._id} />
                    )}

                    {/* Booking ID */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-semibold mb-2">Booking ID</h3>
                        <p className="font-mono text-sm text-muted-foreground break-all">
                            {rental._id}
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
