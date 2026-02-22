import { NextRequest } from "next/server";
import { userController } from "@/lib/controllers/user.controller";

export async function GET(request: NextRequest) {
    return userController.getUsers(request);
}
