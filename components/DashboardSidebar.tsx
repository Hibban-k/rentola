"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Car,
    Plus,
    Calendar,
    Users,
    Settings,
    Shield,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Providers", href: "/admin/providers", icon: Users },
    { label: "Rentals", href: "/admin/rentals", icon: Calendar },
    { label: "Users", href: "/admin/users", icon: Users },
];

const providerNavItems: NavItem[] = [
    { label: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
    { label: "My Vehicles", href: "/provider/vehicles", icon: Car },
    { label: "Add Vehicle", href: "/provider/vehicles/create", icon: Plus },
    { label: "Rentals", href: "/provider/rentals", icon: Calendar },
];

const userNavItems: NavItem[] = [
    { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { label: "My Rentals", href: "/user/rentals", icon: Calendar },
    { label: "Browse Vehicles", href: "/vehicles", icon: Car },
];

interface DashboardSidebarProps {
    role: "admin" | "provider" | "user";
}

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems =
        role === "admin"
            ? adminNavItems
            : role === "provider"
                ? providerNavItems
                : userNavItems;

    const roleConfig = {
        admin: { icon: Shield, label: "Admin", color: "text-red-500" },
        provider: { icon: Car, label: "Provider", color: "text-blue-500" },
        user: { icon: Users, label: "Renter", color: "text-emerald-500" },
    };

    const RoleIcon = roleConfig[role].icon;

    const isActive = (href: string) => {
        if (href === pathname) return true;
        // Handle nested routes for vehicles
        if (href === "/provider/vehicles" && pathname.startsWith("/provider/vehicles") && pathname !== "/provider/vehicles/create") {
            return true;
        }
        return false;
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg"
            >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-card border-r border-border z-40 pt-20 lg:pt-24 transition-transform lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* User Info */}
                    <div className="mb-6 p-4 bg-muted rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <RoleIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{roleConfig[role].label}</p>
                                <p className={`text-xs flex items-center gap-1 ${roleConfig[role].color}`}>
                                    Dashboard
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href + item.label}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground text-center">
                            Rentola Dashboard
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
