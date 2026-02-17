import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface User extends DefaultUser {
        role?: string;
        providerStatus?: string;
    }

    interface Session {
        user: {
            id?: string;
            email?: string;
            name?: string;
            role?: string;
            providerStatus?: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id?: string;
        role?: string;
        providerStatus?: string;
    }
}
