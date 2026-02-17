"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Clock, Mail, LogOut, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProviderPendingPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/auth");
            return;
        }

        if (session?.user) {
            const user = session.user;

            if (user.role !== "provider") {
                router.push("/unauthorized");
                return;
            }

            if (user.providerStatus === "approved") {
                router.push("/provider/dashboard");
                return;
            }

            setIsLoading(false);
        }
    }, [status, session, router]);

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="pt-24 pb-12 px-4">
                <div className="max-w-lg mx-auto text-center">
                    {session?.user?.providerStatus === "pending" ? (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 bg-amber-500/10 rounded-full flex items-center justify-center">
                                <Clock className="w-10 h-10 text-amber-500" />
                            </div>

                            <h1 className="text-3xl font-bold mb-3">Approval Pending</h1>

                            <p className="text-muted-foreground mb-6">
                                Your provider account is currently under review.
                                Our team will verify your documents and approve your account within 24-48 hours.
                            </p>

                            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
                                <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    What happens next?
                                </h3>
                                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                                    <li>• Our team will review your submitted documents</li>
                                    <li>• You&apos;ll receive an email once approved</li>
                                    <li>• After approval, you can start listing vehicles</li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>

                            <h1 className="text-3xl font-bold mb-3">Application Rejected</h1>

                            <p className="text-muted-foreground mb-6">
                                Unfortunately, your provider application was not approved.
                                This could be due to incomplete or invalid documents.
                            </p>

                            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
                                <h3 className="font-semibold mb-4">What can you do?</h3>
                                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                                    <li>• Contact support for more information</li>
                                    <li>• Ensure your documents are clear and valid</li>
                                    <li>• You may reapply with corrected information</li>
                                </ul>
                            </div>
                        </>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="mailto:support@rentola.com"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            Contact Support
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
