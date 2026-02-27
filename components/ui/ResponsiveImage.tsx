"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Image as ImageIcon, Car, Bike } from "lucide-react";

interface ResponsiveImageProps extends Omit<ImageProps, "onError"> {
    fallbackType?: "car" | "bike" | "image";
    aspectRatio?: "video" | "square" | "portrait" | "auto";
    containerClassName?: string;
}

export default function ResponsiveImage({
    src,
    alt,
    fallbackType = "image",
    aspectRatio = "video",
    containerClassName = "",
    className = "",
    ...props
}: ResponsiveImageProps) {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const FallbackIcon = {
        car: Car,
        bike: Bike,
        image: ImageIcon,
    }[fallbackType];

    const aspectClasses = {
        video: "aspect-video",
        square: "aspect-square",
        portrait: "aspect-[3/4]",
        auto: "",
    };

    return (
        <div
            className={`relative overflow-hidden bg-muted group ${aspectClasses[aspectRatio]} ${containerClassName}`}
        >
            {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-muted-foreground/10">
                    <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                </div>
            )}

            {error || !src ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/50 gap-2">
                    <FallbackIcon className="w-10 h-10 opacity-20" />
                    <span className="text-[10px] uppercase tracking-widest opacity-30 font-bold">No Image</span>
                </div>
            ) : (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className={`object-cover transition-all duration-500 ${isLoading ? "scale-110 blur-sm" : "scale-100 blur-0"} ${className}`}
                    onLoadingComplete={() => setIsLoading(false)}
                    onError={() => {
                        setError(true);
                        setIsLoading(false);
                    }}
                    {...props}
                />
            )}
        </div>
    );
}
