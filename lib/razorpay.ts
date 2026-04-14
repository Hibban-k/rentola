import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export const getRazorpay = () => {
    if (razorpayInstance) return razorpayInstance;

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        // We throw a clear error here ONLY when someone actually tries to use Razorpay
        // This prevents the build process from crashing if keys are missing.
        throw new Error("Razorpay API keys are missing in environment variables.");
    }

    razorpayInstance = new Razorpay({
        key_id,
        key_secret,
    });

    return razorpayInstance;
};
