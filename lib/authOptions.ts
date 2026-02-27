import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import { connectToDatabase } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectToDatabase();

                const user = await User.findOne({ email: credentials?.email });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(credentials?.password || "", user.password);

                if (!isPasswordValid) {
                    throw new Error("Invalid email or password");
                }

                return user;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.providerStatus = user.providerStatus;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = {
                id: token.id,
                email: token.email || "",
                name: token.name || "",
                role: token.role,
                providerStatus: token.providerStatus,
            };
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth?mode=signin",
        error: "/auth?mode=signin",
        signOut: "/auth?mode=signin",

    },
};



