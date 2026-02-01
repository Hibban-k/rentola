"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, AlertCircle, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/apiClient";

export default function SigninPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { data, error: apiError } = await authApi.signin(formData);

            if (apiError || !data) {
                throw new Error(apiError || "Invalid credentials");
            }

            // Store token
            localStorage.setItem("token", data.token);

            // Redirect based on role
            if (data.user.role === "admin") {
                router.push("/admin/dashboard");
            } else if (data.user.role === "provider" && data.user.providerStatus === "approved") {
                router.push("/provider/dashboard");
            } else {
                router.push("/vehicles");
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                            <Car className="w-5 h-5 text-primary dark:text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">RENTOLA</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
                    <p className="text-muted-foreground">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="text-primary font-medium hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
