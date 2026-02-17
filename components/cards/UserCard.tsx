"use client";

import { User, Shield, Car } from "lucide-react";
import React from "react";

interface UserInfo {
    _id: string;
    name?: string;
    email?: string;
    role: "user" | "provider" | "admin";
    providerStatus?: "pending" | "approved" | "rejected";
    createdAt?: string;
}

interface UserCardProps {
    user: UserInfo;
}

function UserCard({ user }: UserCardProps) {
    const roleConfig = {
        admin: { icon: Shield, color: "text-red-500", bg: "bg-red-500/10", label: "Admin" },
        provider: { icon: Car, color: "text-blue-500", bg: "bg-blue-500/10", label: "Provider" },
        user: { icon: User, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Renter" },
    };

    const config = roleConfig[user.role];
    const Icon = config.icon;

    return (
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${config.bg} rounded-full flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.name || user.email || "User"}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                            {config.label}
                        </span>
                        {user.role === "provider" && user.providerStatus && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.providerStatus === "approved"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : user.providerStatus === "pending"
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-red-500/10 text-red-500"
                                }`}>
                                {user.providerStatus}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground font-mono truncate">
                    ID: {user._id}
                </p>
            </div>
        </div>
    );
}

export default React.memo(UserCard);
