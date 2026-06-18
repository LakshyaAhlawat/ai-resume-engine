"use client"

import { SessionProvider, useSession, signIn, signOut } from "next-auth/react"
import { updateUserProfile } from "@/actions/userActions"

export const AuthProvider = ({ children }) => {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}

export const useAuth = () => {
    const { data: session, status, update } = useSession()

    return {
        user: session?.user || null,
        loading: status === "loading",
        isAuthenticated: () => status === "authenticated",
        login: async (email, password) => {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false
            });
            if (res?.error) throw new Error(res.error);
            return res;
        },
        signUp: async (email, password) => {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Signup failed');
            
            const loginRes = await signIn("credentials", {
                email,
                password,
                redirect: false
            });
            if (loginRes?.error) throw new Error(loginRes.error);
            return loginRes;
        },
        logout: async () => {
            await signOut({ redirect: false });
        },
        loginWithProvider: async (provider) => {
            await signIn(provider, { callbackUrl: "/dashboard" });
        },
        updateProfile: async (updates) => {
            const profileUpdates = {};
            if (updates.full_name !== undefined) profileUpdates.name = updates.full_name;
            if (updates.name !== undefined) profileUpdates.name = updates.name;
            if (updates.role !== undefined) profileUpdates.role = updates.role;
            if (updates.avatar_url !== undefined) profileUpdates.avatar_url = updates.avatar_url;

            const result = await updateUserProfile(profileUpdates);
            if (!result.success) {
                throw new Error(result.error || "Failed to update profile");
            }

            await update({
                user: {
                    name: result.user.name,
                    image: result.user.image,
                    role: result.user.role,
                }
            });

            return result.user;
        }
    }
}
