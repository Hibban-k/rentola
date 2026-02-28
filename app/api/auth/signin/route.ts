import { NextRequest } from "next/server";
import { userController } from "@/lib/controllers/user.controller";

export async function POST(request: NextRequest) {
    return userController.signin(request);
}
