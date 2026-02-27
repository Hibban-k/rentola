import React from "react";
import { Info } from "lucide-react";

interface PlatformChargeInfoProps {
    className?: string;
}

export default function PlatformChargeInfo({ className = "" }: PlatformChargeInfoProps) {
    return (
        <div className={`flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary ${className}`}>
            <Info className="w-4 h-4 shrink-0" />
            <p>
                A standard <span className="font-bold">₹9 platform charge</span> applies to every vehicle listing to ensure quality and maintenance of the platform.
            </p>
        </div>
    );
}
