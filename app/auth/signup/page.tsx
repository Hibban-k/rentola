"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Car, User, Briefcase, ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/apiClient";

type Role = "user" | "provider";

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialRole = searchParams.get("role") as Role | null;

    const [step, setStep] = useState<"role" | "form">(initialRole ? "form" : "role");
    const [selectedRole, setSelectedRole] = useState<Role>(initialRole || "user");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        setStep("form");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error: apiError } = await authApi.signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: selectedRole,
            });

            if (apiError || !data) {
                throw new Error(apiError || "Signup failed");
            }

            setSuccess(true);

            // Redirect after a short delay
            setTimeout(() => {
                router.push("/auth/signin");
            }, 2000);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                            <Car className="w-5 h-5 text-primary dark:text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">RENTOLA</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Create your account</h1>
                    <p className="text-muted-foreground">
                        {step === "role" ? "Choose how you want to use Rentola" : `Signing up as ${selectedRole === "user" ? "Renter" : "Provider"}`}
                    </p>
                </div>

                {/* Role Selection Step */}
                {step === "role" && (
                    <div className="space-y-4">
                        {/* Renter Card */}
                        <button
                            onClick={() => handleRoleSelect("user")}
                            className="w-full p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all text-left group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-1">Sign up as Renter</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Browse and rent premium vehicles from our verified providers.
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Provider Card */}
                        <button
                            onClick={() => handleRoleSelect("provider")}
                            className="w-full p-6 rounded-2xl border-2 border-border bg-card hover:border-secondary/50 hover:shadow-lg transition-all text-left group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                                    <Briefcase className="w-6 h-6 text-secondary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-1">Sign up as Provider</h3>
                                    <p className="text-sm text-muted-foreground">
                                        List your vehicles and earn by renting them out.
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>Admin approval required before listing</span>
                                    </div>
                                </div>
                            </div>
                        </button>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Already have an account?{" "}
                            <Link href="/auth/signin" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                )}

                {/* Form Step */}
                {step === "form" && (
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        {/* Back Button */}
                        {!initialRole && (
                            <button
                                onClick={() => setStep("role")}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Change role
                            </button>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <p className="font-medium text-emerald-700 dark:text-emerald-400">Account created!</p>
                                    <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
                                <AlertCircle className="w-5 h-5 text-destructive" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        {/* Provider Notice */}
                        {selectedRole === "provider" && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-700 dark:text-amber-400">Provider Approval Required</p>
                                    <p className="text-sm text-muted-foreground">
                                        After signup, your account will be reviewed by our team. You can add vehicles once approved.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

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
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || success}
                                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
                            >
                                {isLoading ? "Creating account..." : "Create Account"}
                            </button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Already have an account?{" "}
                            <Link href="/auth/signin" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
