"use client";

import { useState, FormEvent, useRef, ChangeEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, Shield, AlertCircle, Loader2, Upload, FileText, X, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/apiClient";

type AuthMode = "signin" | "signup";
type UserRole = "user" | "provider";

interface UploadedFile {
    file: File;
    type: string;
    previewUrl?: string;
}

export function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<AuthMode>("signin");
    const [role, setRole] = useState<UserRole>("user");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // Check for mode and role in URL params (e.g., /auth?mode=signup&role=provider)
    useEffect(() => {
        const modeParam = searchParams.get("mode");
        const roleParam = searchParams.get("role");

        if (modeParam === "signup") {
            setMode("signup");
        }
        if (roleParam === "provider") {
            setMode("signup"); // Always show signup for provider
            setRole("provider");
        }
    }, [searchParams]);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

        if (!allowedTypes.includes(file.type)) {
            setError("Please upload a valid document (JPG, PNG, WebP, or PDF)");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        const newFile: UploadedFile = {
            file,
            type: "license", // Default type
            previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        };

        setUploadedFiles(prev => [...prev, newFile]);
        setError(null);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => {
            const updated = [...prev];
            if (updated[index].previewUrl) {
                URL.revokeObjectURL(updated[index].previewUrl!);
            }
            updated.splice(index, 1);
            return updated;
        });
    };

    const updateFileType = (index: number, type: string) => {
        setUploadedFiles(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], type };
            return updated;
        });
    };

    // Convert file to base64 for upload (you may use a file upload service instead)
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === "signup") {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            if (formData.password.length < 6) {
                setError("Password must be at least 6 characters");
                return;
            }
            if (role === "provider" && uploadedFiles.length === 0) {
                setError("Please upload at least one document (license or ID) to register as a provider");
                return;
            }
        }

        setIsLoading(true);

        try {
            if (mode === "signin") {
                // Use NextAuth signIn
                const result = await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.error) {
                    throw new Error(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
                }

                if (result?.ok) {
                    // Get callback URL or determine redirect based on session
                    const callbackUrl = searchParams.get("callbackUrl");
                    if (callbackUrl) {
                        router.push(callbackUrl);
                    } else {
                        // Refresh to let the proxy/session determine the correct dashboard
                        router.refresh();
                        router.push("/");
                    }
                }
            } else {
                // Prepare documents for upload
                const documents = await Promise.all(
                    uploadedFiles.map(async (f) => ({
                        type: f.type,
                        url: await fileToBase64(f.file),
                    }))
                );

                const { data, error: apiError } = await authApi.signup({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: role,
                    documents: role === "provider" ? documents : undefined,
                });

                if (apiError) {
                    throw new Error(apiError);
                }

                if (data?.token) {
                    // After signup, sign in with NextAuth
                    const result = await signIn("credentials", {
                        email: formData.email,
                        password: formData.password,
                        redirect: false,
                    });

                    if (result?.ok) {
                        if (role === "provider") {
                            router.push("/provider/pending");
                        } else {
                            router.push("/user/dashboard");
                        }
                    }
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {mode === "signin" ? "Welcome back" : "Create account"}
                    </h1>
                    <p className="text-muted-foreground">
                        {mode === "signin"
                            ? "Sign in to continue to Rentola"
                            : "Join Rentola to rent or list vehicles"
                        }
                    </p>
                </div>

                {/* Mode Tabs */}
                <div className="flex gap-2 p-1 bg-muted rounded-xl mb-6">
                    <button
                        onClick={() => { setMode("signin"); setError(null); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "signin"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setMode("signup"); setError(null); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "signup"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name (signup only) */}
                        {mode === "signup" && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password (signup only) */}
                        {mode === "signup" && (
                            <>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full pl-10 pr-12 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-3">
                                        I want to...
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setRole("user")}
                                            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${role === "user"
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                                }`}
                                        >
                                            <User className={`w-5 h-5 ${role === "user" ? "text-primary" : "text-muted-foreground"}`} />
                                            <span className={role === "user" ? "font-semibold" : ""}>Rent</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole("provider")}
                                            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${role === "provider"
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                                }`}
                                        >
                                            <Shield className={`w-5 h-5 ${role === "provider" ? "text-primary" : "text-muted-foreground"}`} />
                                            <span className={role === "provider" ? "font-semibold" : ""}>List</span>
                                        </button>
                                    </div>
                                    {role === "provider" && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Provider accounts require document verification before listing vehicles.
                                        </p>
                                    )}
                                </div>

                                {/* Document Upload (Provider only) */}
                                {role === "provider" && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Upload Documents <span className="text-destructive">*</span>
                                        </label>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Upload your license, ID, or other verification documents (JPG, PNG, WebP, PDF - max 5MB)
                                        </p>

                                        {/* Upload Button */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-all flex items-center justify-center gap-2 text-muted-foreground"
                                        >
                                            <Upload className="w-5 h-5" />
                                            <span>Click to upload document</span>
                                        </button>

                                        {/* Uploaded Files List */}
                                        {uploadedFiles.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {uploadedFiles.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 p-3 bg-muted rounded-xl"
                                                    >
                                                        {file.previewUrl ? (
                                                            <img
                                                                src={file.previewUrl}
                                                                alt="Preview"
                                                                className="w-10 h-10 object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                                <FileText className="w-5 h-5 text-primary" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{file.file.name}</p>
                                                            <select
                                                                value={file.type}
                                                                onChange={(e) => updateFileType(index, e.target.value)}
                                                                className="text-xs bg-background border border-input rounded-md px-2 py-1 mt-1"
                                                            >
                                                                <option value="license">Driver&apos;s License</option>
                                                                <option value="id">Government ID</option>
                                                                <option value="registration">Vehicle Registration</option>
                                                                <option value="insurance">Insurance Document</option>
                                                                <option value="other">Other Document</option>
                                                            </select>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                                                        >
                                                            <X className="w-4 h-4 text-destructive" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {mode === "signin" ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        {mode === "signin" ? (
                            <p>
                                Don&apos;t have an account?{" "}
                                <button
                                    onClick={() => { setMode("signup"); setError(null); }}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Sign up
                                </button>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{" "}
                                <button
                                    onClick={() => { setMode("signin"); setError(null); }}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Sign in
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
