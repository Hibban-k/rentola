"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import ImageUpload from "@/components/ImageUpload";
import { ArrowLeft, Car, Bike, AlertCircle, Trash2, Loader2, X } from "lucide-react";
import { providerApi } from "@/lib/apiClient";

interface ImageUrl {
    type: string;
    url: string;
}

interface Vehicle {
    _id: string;
    name: string;
    type: "car" | "bike";
    licensePlate: string;
    pricePerDay: number;
    isAvailable: boolean;
    vehicleImageUrl?: ImageUrl[];
}

export default function EditVehiclePage() {
    const router = useRouter();
    const params = useParams();
    const vehicleId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [imageUrls, setImageUrls] = useState<ImageUrl[]>([]);
    const [isUpdatingImages, setIsUpdatingImages] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        type: "car" as "car" | "bike",
        licensePlate: "",
        pricePerDay: "",
        isAvailable: true,
    });

    // Fetch vehicle data
    const { data: session, status } = useSession();

    // Fetch vehicle data
    useEffect(() => {
        const fetchVehicle = async () => {
            if (status === "loading") return;

            if (status === "unauthenticated") {
                router.push("/auth");
                return;
            }

            try {
                const { data, error: apiError } = await providerApi.getVehicle(vehicleId);

                if (apiError) {
                    throw new Error(apiError);
                }

                if (!data?.vehicle) {
                    throw new Error("Vehicle not found");
                }

                const vehicle = data.vehicle;

                setFormData({
                    name: vehicle.name,
                    type: vehicle.type,
                    licensePlate: vehicle.licensePlate,
                    pricePerDay: vehicle.pricePerDay.toString(),
                    isAvailable: vehicle.isAvailable,
                });
                setImageUrls(vehicle.vehicleImageUrl || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load vehicle");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicle();
    }, [vehicleId, router, status, session]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            const { error: apiError } = await providerApi.updateVehicle(vehicleId, {
                name: formData.name,
                pricePerDay: Number(formData.pricePerDay),
                isAvailable: formData.isAvailable,
            });

            if (apiError) {
                throw new Error(apiError);
            }

            router.push("/provider/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update vehicle");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const { error: apiError } = await providerApi.deleteVehicle(vehicleId);

            if (apiError) {
                throw new Error("Failed to delete vehicle");
            }

            router.push("/provider/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete vehicle");
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
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
                    <h1 className="text-3xl font-bold">Edit Vehicle</h1>
                </div>

                {/* Form */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            />
                        </div>

                        {/* Vehicle Type (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Vehicle Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 ${formData.type === "car"
                                        ? "border-primary bg-primary/5"
                                        : "border-border opacity-50"
                                        }`}
                                >
                                    <Car className={`w-6 h-6 ${formData.type === "car" ? "text-primary" : "text-muted-foreground"}`} />
                                    <span className={formData.type === "car" ? "font-semibold" : ""}>Car</span>
                                </div>
                                <div
                                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 ${formData.type === "bike"
                                        ? "border-primary bg-primary/5"
                                        : "border-border opacity-50"
                                        }`}
                                >
                                    <Bike className={`w-6 h-6 ${formData.type === "bike" ? "text-primary" : "text-muted-foreground"}`} />
                                    <span className={formData.type === "bike" ? "font-semibold" : ""}>Bike</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Vehicle type cannot be changed.</p>
                        </div>

                        {/* License Plate (Read-only) */}
                        <div>
                            <label htmlFor="licensePlate" className="block text-sm font-medium mb-1.5">
                                License Plate
                            </label>
                            <input
                                id="licensePlate"
                                type="text"
                                value={formData.licensePlate}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-input bg-muted cursor-not-allowed uppercase"
                            />
                            <p className="text-xs text-muted-foreground mt-1">License plate cannot be changed.</p>
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
                            />
                        </div>

                        {/* Vehicle Images Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium">Vehicle Images</label>
                                <span className="text-xs text-muted-foreground">
                                    {imageUrls.length} image(s)
                                </span>
                            </div>

                            {/* Current Images */}
                            {imageUrls.length > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                    {imageUrls.map((img, index) => (
                                        <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-border">
                                            <Image
                                                src={img.url}
                                                alt={`Vehicle image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 200px"
                                            />
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    setIsUpdatingImages(true);
                                                    const newImages = imageUrls.filter((_, i) => i !== index);
                                                    const { error: apiError } = await providerApi.updateVehicle(vehicleId, {
                                                        vehicleImageUrl: newImages,
                                                    });
                                                    if (!apiError) {
                                                        setImageUrls(newImages);
                                                    } else {
                                                        setError("Failed to remove image");
                                                    }
                                                    setIsUpdatingImages(false);
                                                }}
                                                disabled={isUpdatingImages}
                                                className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload New Images */}
                            <div className="pt-2">
                                <ImageUpload
                                    folder="vehicles"
                                    onUploadSuccess={async (file) => {
                                        setIsUpdatingImages(true);
                                        const newImages = [...imageUrls, { type: "image", url: file.url }];
                                        const { error: apiError } = await providerApi.updateVehicle(vehicleId, {
                                            vehicleImageUrl: newImages,
                                        });
                                        if (!apiError) {
                                            setImageUrls(newImages);
                                        } else {
                                            setError("Failed to add image");
                                        }
                                        setIsUpdatingImages(false);
                                    }}
                                    label={isUpdatingImages ? "Updating..." : "Add More Images"}
                                    maxFiles={5 - imageUrls.length}
                                />
                            </div>

                            {imageUrls.length === 0 && (
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                    No images uploaded yet. Add at least one image.
                                </p>
                            )}
                        </div>

                        {/* Availability Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                            <div>
                                <p className="font-medium">Availability</p>
                                <p className="text-sm text-muted-foreground">
                                    {formData.isAvailable ? "Vehicle is available for rent" : "Vehicle is not available"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                                className={`relative w-14 h-7 rounded-full transition-colors ${formData.isAvailable ? "bg-emerald-500" : "bg-muted-foreground/30"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${formData.isAvailable ? "translate-x-7" : ""
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="py-3 px-4 bg-destructive/10 text-destructive font-semibold rounded-xl hover:bg-destructive/20 transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-2">Delete Vehicle?</h2>
                        <p className="text-muted-foreground mb-6">
                            This action cannot be undone. The vehicle will be permanently removed from your listings.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 py-3 px-4 border border-border rounded-xl hover:bg-muted transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 px-4 bg-destructive text-white font-semibold rounded-xl hover:bg-destructive/90 disabled:opacity-50 transition-all"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
