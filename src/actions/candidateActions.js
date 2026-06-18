"use server"

import dbConnect from "@/lib/db";
import Candidate from "@/models/Candidate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function saveCandidate(candidateData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        await dbConnect();
        
        const candidate = await Candidate.create({
            ...candidateData,
            user_id: session.user.id
        });

        const serializedCandidate = JSON.parse(JSON.stringify(candidate));
        serializedCandidate.id = serializedCandidate._id;
        
        return { success: true, candidate: serializedCandidate };
    } catch (error) {
        console.error("Failed to save candidate:", error);
        return { success: false, error: error.message };
    }
}

export async function getCandidates() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        await dbConnect();
        
        const candidates = await Candidate.find({ user_id: session.user.id })
                                        .sort({ createdAt: -1 })
                                        .lean();

        const serialized = candidates.map(c => {
            const mapped = JSON.parse(JSON.stringify(c));
            mapped.id = mapped._id;
            return mapped;
        });

        return { success: true, candidates: serialized };
    } catch (error) {
        console.error("Failed to get candidates:", error);
        return { success: false, error: error.message };
    }
}

export async function getCandidateById(id) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        await dbConnect();
        
        const candidate = await Candidate.findOne({ _id: id, user_id: session.user.id }).lean();

        if (!candidate) {
             throw new Error("Candidate not found");
        }

        const serialized = JSON.parse(JSON.stringify(candidate));
        serialized.id = serialized._id;

        return { success: true, candidate: serialized };
    } catch (error) {
        console.error("Failed to get candidate:", error);
        return { success: false, error: error.message };
    }
}

export async function getCandidatesByIds(ids) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        await dbConnect();
        
        const candidates = await Candidate.find({ _id: { $in: ids }, user_id: session.user.id }).lean();

        const serialized = candidates.map(c => {
            const mapped = JSON.parse(JSON.stringify(c));
            mapped.id = mapped._id;
            return mapped;
        });

        return { success: true, candidates: serialized };
    } catch (error) {
        console.error("Failed to get candidates:", error);
        return { success: false, error: error.message };
    }
}

export async function updateCandidate(id, updates) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        await dbConnect();

        const candidate = await Candidate.findOneAndUpdate(
            { _id: id, user_id: session.user.id },
            { $set: updates },
            { new: true }
        ).lean();

        if (!candidate) {
            throw new Error("Candidate not found");
        }

        const serialized = JSON.parse(JSON.stringify(candidate));
        serialized.id = serialized._id;

        return { success: true, candidate: serialized };
    } catch (error) {
        console.error("Failed to update candidate:", error);
        return { success: false, error: error.message };
    }
}

export async function updateCandidateChatHistory(id, chatHistory) {
    return updateCandidate(id, { chat_history: chatHistory });
}

export async function deleteCandidate(id) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        await dbConnect();

        const result = await Candidate.deleteOne({ _id: id, user_id: session.user.id });

        if (result.deletedCount === 0) {
            throw new Error("Candidate not found");
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete candidate:", error);
        return { success: false, error: error.message };
    }
}
