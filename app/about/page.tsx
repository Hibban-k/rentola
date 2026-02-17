"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Search,
    Calendar,
    Car,
    Shield,
    CheckCircle,
    Users,
    Star,
    ArrowRight,
    UserPlus,
    ClipboardCheck,
    Key
} from "lucide-react";

const steps = [
    {
        icon: Search,
        title: "Browse Vehicles",
        description: "Explore our curated collection of premium cars and bikes. Filter by type, price, and availability to find your perfect ride.",
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        icon: Calendar,
        title: "Pick Your Dates",
        description: "Select your rental period and pickup location. Our flexible booking system works around your schedule.",
        color: "bg-emerald-500/10 text-emerald-500",
    },
    {
        icon: ClipboardCheck,
        title: "Book Instantly",
        description: "Confirm your booking with just a few clicks. Receive instant confirmation and all the details you need.",
        color: "bg-purple-500/10 text-purple-500",
    },
    {
        icon: Key,
        title: "Hit the Road",
        description: "Pick up your vehicle at the designated location. Our providers ensure everything is ready for your journey.",
        color: "bg-amber-500/10 text-amber-500",
    },
];

const providerSteps = [
    {
        icon: UserPlus,
        title: "Create Account",
        description: "Sign up as a provider and submit your verification documents for review.",
    },
    {
        icon: Shield,
        title: "Get Verified",
        description: "Our team reviews your documents and approves your provider account.",
    },
    {
        icon: Car,
        title: "List Vehicles",
        description: "Add your vehicles with photos, descriptions, and set your own pricing.",
    },
    {
        icon: Star,
        title: "Start Earning",
        description: "Accept bookings, manage rentals, and earn money from your vehicles.",
    },
];

const features = [
    {
        icon: Shield,
        title: "Verified Providers",
        description: "All providers are verified with proper documentation",
    },
    {
        icon: CheckCircle,
        title: "Quality Assured",
        description: "Vehicles are inspected and maintained to high standards",
    },
    {
        icon: Users,
        title: "24/7 Support",
        description: "Our team is always here to help with any issues",
    },
    {
        icon: Star,
        title: "Best Prices",
        description: "Competitive rates directly from vehicle owners",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        <Car className="w-4 h-4" />
                        Simple & Transparent
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        How <span className="text-primary">Rentola</span> Works
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Renting a vehicle has never been easier. Whether you want to rent or list your vehicle,
                        we&apos;ve made the process simple, secure, and seamless.
                    </p>
                </div>
            </section>

            {/* For Renters Section */}
            <section className="py-20 px-4 bg-muted/30">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">For Renters</h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Find and book your perfect vehicle in just 4 simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, index) => (
                            <div
                                key={step.title}
                                className="relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all group"
                            >
                                {/* Step Number */}
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                                    {index + 1}
                                </div>

                                <div className={`w-14 h-14 ${step.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <step.icon className="w-7 h-7" />
                                </div>

                                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/vehicles"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all shadow-lg"
                        >
                            Browse Vehicles
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* For Providers Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">For Vehicle Owners</h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Turn your vehicle into a source of income with our trusted platform
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {providerSteps.map((step, index) => (
                            <div key={step.title} className="text-center">
                                <div className="relative inline-block mb-6">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                        <step.icon className="w-10 h-10 text-primary" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-muted-foreground text-sm">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/auth?mode=signup&role=provider"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background font-semibold rounded-full hover:bg-foreground/90 transition-all shadow-lg"
                        >
                            Become a Provider
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-muted/30">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Rentola?</h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            We prioritize safety, quality, and your satisfaction
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all"
                            >
                                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <feature.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-3xl p-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                            Join thousands of happy renters and providers on Rentola today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/vehicles"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all"
                            >
                                Find a Vehicle
                            </Link>
                            <Link
                                href="/auth?mode=signup&role=provider"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary/10 transition-all"
                            >
                                List Your Vehicle
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
