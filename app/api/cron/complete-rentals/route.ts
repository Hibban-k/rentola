import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Rental from "@/models/Rental";
import { getAdminUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        //  have to do this for security some work
        const cronSecret = request.headers.get("x-cron-secret");
        const isValidCronSecret = cronSecret === process.env.CRON_SECRET;

        if (!isValidCronSecret) {
            try {
                getAdminUser(request);
            } catch (err: any) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        await connectToDatabase();

        const now = new Date();

        // 1. Activate pending rentals where start date has arrived
        const activatedResult = await Rental.updateMany(
            {
                status: 'pending',
                "rentalPeriod.startDate": { $lte: now }
            },
            {
                $set: { status: 'active' }
            }
        );

        // 2. Complete active rentals where end date has passed
        const completedResult = await Rental.updateMany(
            {
                status: 'active',
                "rentalPeriod.endDate": { $lt: now }
            },
            {
                $set: { status: 'completed' }
            }
        );

        return NextResponse.json({
            success: true,
            message: `${activatedResult.modifiedCount} rental(s) activated, ${completedResult.modifiedCount} rental(s) completed`
        }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
