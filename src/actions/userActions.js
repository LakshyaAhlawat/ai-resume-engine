"use server"

import { put } from "@vercel/blob";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateUserProfile(updates) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        await dbConnect();

        const allowedFields = {};
        if (updates.name !== undefined) allowedFields.name = updates.name;
        if (updates.role !== undefined) allowedFields.role = updates.role;
        if (updates.avatar_url !== undefined) allowedFields.avatar_url = updates.avatar_url;

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $set: allowedFields },
            { new: true }
        ).lean();

        if (!user) {
            throw new Error("User not found");
        }

        return {
            success: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name || "",
                role: user.role || "",
                image: user.avatar_url || "",
            },
        };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { success: false, error: error.message };
    }
}

export async function uploadAvatar(formData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const file = formData.get("file");
        if (!file) {
            throw new Error("No file uploaded");
        }

        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const fileName = `avatars/${session.user.id}-${Date.now()}-${sanitizedName}`;

        const blob = await put(fileName, file, { access: "public" });
        return { success: true, url: blob.url };
    } catch (error) {
        console.error("Avatar upload error:", error);
        return { success: false, error: error.message };
    }
}
