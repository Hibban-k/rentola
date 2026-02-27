"use client";

import React, { useActionState } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { acceptRentalAction, rejectRentalAction } from "@/lib/actions/rental.actions";

interface RentalStatusActionsProps {
    rentalId: string;
}

export default function RentalStatusActions({ rentalId }: RentalStatusActionsProps) {
    const [acceptState, acceptFormAction, isAccepting] = useActionState(acceptRentalAction, null);
    const [rejectState, rejectFormAction, isRejecting] = useActionState(rejectRentalAction, null);

    const isLoading = isAccepting || isRejecting;
    const error = acceptState?.error || rejectState?.error;

    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Actions</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="space-y-3">
                <button
                    onClick={() => acceptFormAction(rentalId)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                    <Check className="w-4 h-4" />
                    {isAccepting ? "Accepting..." : "Accept Booking"}
                </button>
                <button
                    onClick={() => rejectFormAction(rentalId)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                    <X className="w-4 h-4" />
                    {isRejecting ? "Rejecting..." : "Reject Booking"}
                </button>
            </div>
        </div>
    );
}
