import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <HeroSection />
      {/* Featured Section Placeholder */}
      <section className="py-24 bg-accent/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Latest Arrivals</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Explore our newest additions to the fleet. Meticulously maintained and ready for your next adventure.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-muted rounded-xl border border-border flex items-center justify-center">
                <span className="text-muted-foreground">Vehicle Card {i} Placeholder</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
