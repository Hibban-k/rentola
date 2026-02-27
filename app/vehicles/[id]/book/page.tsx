import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { vehicleService } from "@/lib/services/vehicle.service";
import BookingForm from "./BookingForm";
import { Vehicle } from "@/lib/apiClient";

export default async function BookVehiclePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let vehicle;
    try {
        const rawVehicle = await vehicleService.getVehicleById(id);
        vehicle = JSON.parse(JSON.stringify(rawVehicle)) as Vehicle;
    } catch (err) {
        vehicle = null;
    }

    if (!vehicle) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 pt-24 container mx-auto px-4 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Vehicle not found</h2>
                        <p className="text-muted-foreground mb-6">The vehicle you are trying to book does not exist.</p>
                        <Link
                            href="/vehicles"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Vehicles
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={`/vehicles/${id}`}
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Vehicle
                        </Link>
                        <h1 className="text-3xl font-bold">Book Vehicle</h1>
                    </div>

                    <BookingForm vehicle={vehicle} id={id} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
