import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
    return (
        <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2940&auto=format&fit=crop"
                    alt="Luxury Car Background"
                    fill
                    className="object-cover"
                
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center mt-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-white/90 uppercase tracking-wider">
                        Premium Fleet Available
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-8 drop-shadow-lg max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
                    Elevate Your Journey with <span className="text-white/90">Premium Rentals</span>
                </h1>

                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
                    Experience the thrill of the road with our curated collection of luxury and classic vehicles. Strictly vetted for your comfort and style.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-both">
                    <Link
                        href="/vehicles"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all transform hover:scale-105 shadow-xl"
                    >
                        Find a Vehicle
                    </Link>
                    <Link
                        href="/auth/signup?role=provider"
                        className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all backdrop-blur-sm"
                    >
                        List Your Vehicle
                    </Link>
                </div>
            </div>
        </div>
    );
}
