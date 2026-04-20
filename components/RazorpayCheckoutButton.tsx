"use client";

import { useState } from "react";
import { useRazorpay } from "react-razorpay";

interface RazorpayCheckoutProps {
    vehicleId: string;
    startDate: string;
    endDate: string;
    amount: number;
    userName: string;
    userEmail: string;
    userContact?: string;
}

export default function RazorpayCheckoutButton({
    vehicleId,
    startDate,
    endDate,
    amount,
    userName,
    userEmail,
    userContact = "9999999999"
}: RazorpayCheckoutProps) {
    const { Razorpay } = useRazorpay();
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        // Diagnostic check: Ensure public keys are loaded in Vercel environment
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            console.error("NEXT_PUBLIC_RAZORPAY_KEY_ID is missing from environment variables.");
            alert("Payment configuration error: Public Key ID is missing. Please check your Vercel Environment variables.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create intent and lock DB booking via our API route
            // This now contains Mongoose ACID transactions and Zod natively
            const res = await fetch("/api/users/rentals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vehicleId, startDate, endDate }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Could not reserve vehicle");
                return;
            }

            // 2. Open Razorpay using the generated server-side Order ID
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", 
                amount: Math.round(data.rental.totalCost * 100), 
                currency: "INR" as const,
                name: "Rentola",
                description: "Vehicle Rental Reservation",
                order_id: data.razorpayOrderId,
                handler: function (response: any) {
                    // Payment successful locally. The Webhook handles DB confirmation securely
                    alert("Payment successful! Redirecting to reservations...");
                    window.location.href = `user/rentals`; 
                },
                prefill: {
                    name: userName,
                    email: userEmail,
                    contact: userContact,
                },
                theme: {
                    color: "#2563eb", // Primary blue theme
                },
            };

            const rzp = new Razorpay(options);
            
            rzp.on("payment.failed", function (response: any) {
                console.error("Payment Failed:", response.error);
                alert("Payment Failed - " + response.error.description);
                // System drops the 'pending' order. Can be cleaned up via cron later.
            });

            rzp.open();
        } catch (error) {
            console.error("Payment initiation failed", error);
            alert("Payment gateway error. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
            {isLoading ? "Starting Secure Checkout..." : `Pay ₹${amount} & Confirm`}
        </button>
    );
}
