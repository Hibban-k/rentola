"use client";

import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import DashboardSidebar from "@/components/DashboardSidebar";

interface DashboardLayoutProps {
    children: ReactNode;
    role: "admin" | "provider" | "user";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="flex">
                <DashboardSidebar role={role} />

                <main className="flex-1 min-h-screen pt-24 pb-12 lg:pl-0">
                    <div className="container mx-auto px-4 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
