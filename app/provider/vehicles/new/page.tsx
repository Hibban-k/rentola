"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Car, Bike, Upload, Plus, X, AlertCircle } from "lucide-react";
import { providerApi, authApi } from "@/lib/apiClient";

interface ImageUrl {
    type: string;
    url: string;
}

export default function AddVehiclePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        type: "car" as "car" | "bike",
        licensePlate: "",
        pricePerDay: "",
    });

    const [imageUrls, setImageUrls] = useState<ImageUrl[]>([]);
    const [newImageUrl, setNewImageUrl] = useState("");

    const addImageUrl = () => {
        if (newImageUrl.trim()) {
            setImageUrls([...imageUrls, { type: "image", url: newImageUrl.trim() }]);
            setNewImageUrl("");
        }
    };

    const removeImageUrl = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (imageUrls.length === 0) {
            setError("Please add at least one image URL");
            return;
        }

        if (!authApi.isLoggedIn()) {
            router.push("/auth/signin");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error: apiError } = await providerApi.createVehicle({
                name: formData.name,
                type: formData.type,
                licensePlate: formData.licensePlate,
                pricePerDay: Number(formData.pricePerDay),
                vehicleImageUrl: imageUrls,
            });

            if (apiError) {
                throw new Error(apiError || "Failed to create vehicle");
            }

            router.push("/provider/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-2xl">
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

                            {/* Image URLs */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Vehicle Images (URLs)</label>
                                <div className="space-y-3">
                                    {/* Existing Images */}
                                    {imageUrls.map((img, index) => (
                                        <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                                            <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className="text-sm truncate flex-1">{img.url}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeImageUrl(index)}
                                                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add New Image */}
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={newImageUrl}
                                            onChange={(e) => setNewImageUrl(e.target.value)}
                                            className="flex-1 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                            placeholder="Paste image URL..."
                                        />
                                        <button
                                            type="button"
                                            onClick={addImageUrl}
                                            className="px-4 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Add direct image URLs (e.g., from Unsplash, Imgur, etc.)
                                    </p>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? "Creating..." : "Add Vehicle"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
