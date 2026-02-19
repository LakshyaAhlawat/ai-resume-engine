import { roomEmitter } from '../emitter';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
        return new Response("Missing roomId", { status: 400 });
    }

    const encoder = new TextEncoder();
    let closed = false;

    const stream = new ReadableStream({
        start(controller) {
            // Send initial heartbeat
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));

            const onUpdate = (data) => {
                if (closed) return;
                if (data.roomId === roomId) {
                    try {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data.room)}\n\n`));
                    } catch (e) {
                        // Stream closed
                    }
                }
            };

            roomEmitter.on('update', onUpdate);

            // Periodic keepalive every 15s
            const keepalive = setInterval(() => {
                if (closed) return;
                try {
                    controller.enqueue(encoder.encode(`: keepalive\n\n`));
                } catch (e) {
                    clearInterval(keepalive);
                }
            }, 15000);

            req.signal.addEventListener('abort', () => {
                closed = true;
                roomEmitter.off('update', onUpdate);
                clearInterval(keepalive);
                try { controller.close(); } catch (e) {}
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
