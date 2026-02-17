import Link from "next/link";
import { ShieldX, Home, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
                    <ShieldX className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold mb-3">Access Denied</h1>

                <p className="text-muted-foreground mb-8">
                    You don&apos;t have permission to access this page.
                    Please check your account role or contact support if you believe this is an error.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go to Home
                    </Link>

                    <Link
                        href="/auth"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        Sign in with different account
                    </Link>
                </div>
            </div>
        </div>
    );
}
