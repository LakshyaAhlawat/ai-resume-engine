import { NextResponse } from 'next/server';

const ROOMS = new Map();

export async function POST(req) {
    try {
        const { roomId, config, user } = await req.json();

        if (ROOMS.has(roomId)) {
            const room = ROOMS.get(roomId);
            
            if (user && !room.members[user.id]) {
                room.members[user.id] = {
                    id: user.id,
                    name: user.name || "Anonymous",
                    team: user.team,
                    progress: 0,
                    status: 'joined',
                    points: 0
                };
            }
            
            return NextResponse.json({ success: true, room });
        }

        const room = {
            id: roomId,
            config: config || { source: 'ai', difficulty: 'Medium', qCount: 1, questions: [] },
            createdAt: new Date(),
            questions: [], 
            members: user ? {
                [user.id]: {
                    id: user.id,
                    name: user.name || "Anonymous",
                    team: user.team,
                    progress: 0,
                    status: 'joined',
                    points: 0
                }
            } : {}
        };
        
        ROOMS.set(roomId, room);
        return NextResponse.json({ success: true, room });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Sync failure" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { roomId, userId, progress, status, points, questions, config } = await req.json();
        if (ROOMS.has(roomId)) {
            const room = ROOMS.get(roomId);
            
            if (questions) room.questions = questions;
            if (config) room.config = config;
            
            if (userId && room.members[userId]) {
                if (progress !== undefined) room.members[userId].progress = progress;
                if (status) room.members[userId].status = status;
                if (points !== undefined) room.members[userId].points = points;
            }
            
            return NextResponse.json({ success: true, room });
        }
        return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Update failure" }, { status: 500 });
    }
}

// Support GET to fetch live room state
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    
    if (ROOMS.has(roomId)) {
        return NextResponse.json({ success: true, room: ROOMS.get(roomId) });
    }
    return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
}
