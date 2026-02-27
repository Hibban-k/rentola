"use client";

import { useState, useActionState, useEffect, startTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ImageUpload from "@/components/ImageUpload";
import { ArrowLeft, Car, Bike, AlertCircle } from "lucide-react";
import { VehicleImage } from "@/lib/apiClient";
import { createVehicleAction } from "@/lib/actions/vehicle.actions";
import PlatformChargeInfo from "@/components/ui/PlatformChargeInfo";

export default function AddVehiclePage() {
    const router = useRouter();
    const { status: authStatus } = useSession();

    // Server Action State
    const [state, formAction, isPending] = useActionState(createVehicleAction, null);

    const [formData, setFormData] = useState({
        name: "",
        type: "car" as "car" | "bike",
        licensePlate: "",
        pricePerDay: "",
        pickupStation: "",
    });

    const [imageUrls, setImageUrls] = useState<VehicleImage[]>([]);

    // Handle Server Action responses
    useEffect(() => {
        if (state?.success) {
            router.push("/provider/dashboard");
        }
    }, [state, router]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (imageUrls.length === 0) {
            // we could handle this local error or pass to state
            return;
        }

        if (authStatus === "unauthenticated") {
            router.push("/auth");
            return;
        }

        // Trigger the Server Action
        startTransition(() => {
            formAction({
                name: formData.name,
                type: formData.type,
                licensePlate: formData.licensePlate,
                pricePerDay: Number(formData.pricePerDay),
                vehicleImageUrl: imageUrls,
                pickupStation: formData.pickupStation,
            });
        });
    };

    return (
        <DashboardLayout role="provider">
            <div className="max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/provider/dashboard"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">Add New Vehicle</h1>
                </div>

                {/* Form */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    {(state?.error || (imageUrls.length === 0 && state === null)) && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                            <p className="text-sm text-destructive">
                                {state?.error || (imageUrls.length === 0 ? "Please add at least one image URL" : "")}
                            </p>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Vehicle Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                                Vehicle Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                placeholder="e.g., Honda City 2023"
                            />
                        </div>

                        {/* Vehicle Type */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Vehicle Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "car" })}
                                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${formData.type === "car"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                        }`}
                                >
                                    <Car className={`w-6 h-6 ${formData.type === "car" ? "text-primary" : "text-muted-foreground"}`} />
                                    <span className={formData.type === "car" ? "font-semibold" : ""}>Car</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "bike" })}
                                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${formData.type === "bike"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                        }`}
                                >
                                    <Bike className={`w-6 h-6 ${formData.type === "bike" ? "text-primary" : "text-muted-foreground"}`} />
                                    <span className={formData.type === "bike" ? "font-semibold" : ""}>Bike</span>
                                </button>
                            </div>
                        </div>

                        {/* License Plate */}
                        <div>
                            <label htmlFor="licensePlate" className="block text-sm font-medium mb-1.5">
                                License Plate
                            </label>
                            <input
                                id="licensePlate"
                                type="text"
                                required
                                value={formData.licensePlate}
                                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all uppercase"
                                placeholder="e.g., MH01AB1234"
                            />
                        </div>

                        {/* Price Per Day */}
                        <div>
                            <label htmlFor="pricePerDay" className="block text-sm font-medium mb-1.5">
                                Price Per Day (₹)
                            </label>
                            <input
                                id="pricePerDay"
                                type="number"
                                required
                                min="1"
                                value={formData.pricePerDay}
                                onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                placeholder="e.g., 2500"
                            />
                        </div>

                        {/* Pickup Station */}
                        <div>
                            <label htmlFor="pickupStation" className="block text-sm font-medium mb-1.5">
                                Pickup Station
                            </label>
                            <input
                                id="pickupStation"
                                type="text"
                                required
                                value={formData.pickupStation}
                                onChange={(e) => setFormData({ ...formData, pickupStation: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                placeholder="e.g., Mumbai Central Station"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Vehicle Images</label>
                            <ImageUpload
                                folder="vehicles"
                                onUploadSuccess={(file) => {
                                    setImageUrls(prev => [...prev, { type: "image", url: file.url }]);
                                }}
                                label="Upload Vehicle Images"
                                maxFiles={5}
                            />
                            {imageUrls.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    {imageUrls.length} image(s) uploaded
                                </p>
                            )}
                        </div>

                        {/* Platform Charge */}
                        <PlatformChargeInfo />

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isPending ? "Creating..." : "Add Vehicle"}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
