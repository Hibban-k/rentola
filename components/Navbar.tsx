"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Car, User } from "lucide-react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 sm:px-6 lg:px-8">
            <nav
                className={`w-full max-w-5xl transition-all duration-300 ease-in-out ${isScrolled
                        ? "bg-background/70 backdrop-blur-md shadow-lg border border-white/10 dark:border-white/5"
                        : "bg-background/50 backdrop-blur-sm border border-transparent"
                    } rounded-full px-6 py-3 flex items-center justify-between`}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                        <Car className="w-5 h-5 text-primary dark:text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        RENTOLA
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="/vehicles"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Browse
                    </Link>
                    <Link
                        href="/about"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        How it Works
                    </Link>
                </div>

                {/* Auth Buttons */}
                {
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/auth/signin"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
                    >
                        Sign Up
                    </Link>
                </div>
}
                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl p-4 flex flex-col gap-4 md:hidden animate-in fade-in slide-in-from-top-4">
                    <Link
                        href="/vehicles"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <Car className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Browse Vehicles</span>
                    </Link>
                    <div className="h-px bg-border my-1" />
                    <Link
                        href="/auth/signin"
                        className="flex items-center justify-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Log in
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="flex items-center justify-center p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-bold"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Sign Up
                    </Link>
                </div>
            )}
        </div>
    );
}
