"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadResumeBlob(formData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const file = formData.get("file");
        if (!file) {
            throw new Error("No file uploaded");
        }

        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueName = `${Math.random().toString(36).substr(2, 9)}-${sanitizedName}`;

        // ── Production: Use Vercel Blob ──────────────────────────────────────
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const { put } = await import("@vercel/blob");
            const blob = await put(`resumes/${uniqueName}`, file, { access: 'public' });
            console.log("✅ Uploaded to Vercel Blob:", blob.url);
            return { success: true, url: blob.url };
        }

        // ── Development: Save to public/uploads/ ─────────────────────────────
        console.log("📁 BLOB_READ_WRITE_TOKEN not set — using local storage (dev mode)");

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, uniqueName);
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${uniqueName}`;
        console.log("✅ Saved locally:", publicUrl);

        return { success: true, url: publicUrl };

    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: error.message };
    }
}
