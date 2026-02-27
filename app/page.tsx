import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import Footer from "@/components/Footer";
import { vehicleService } from "@/lib/services/vehicle.service";
import VehicleCard from "@/components/cards/VehicleCard";

export default async function Home() {
  const rawVehicles = await vehicleService.getAllVehicles({});
  const latestVehicles = JSON.parse(JSON.stringify(rawVehicles)).slice(0, 3);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <HeroSection />

      {/* Latest Arrivals Section */}
      <section className="py-24 bg-accent/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Latest Arrivals</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Explore our newest additions to the fleet. Meticulously maintained and ready for your next adventure.
          </p>

          {latestVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestVehicles.map((vehicle: any) => (
                <div key={vehicle._id} className="text-left">
                  <VehicleCard vehicle={vehicle} variant="browse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-card border border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground">New vehicles arriving soon!</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
