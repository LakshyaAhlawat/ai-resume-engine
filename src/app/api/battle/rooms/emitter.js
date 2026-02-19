import { EventEmitter } from 'events';

// Singleton event emitter shared between rooms API and SSE stream
// Survives across requests within the same Node.js process
const globalForEmitter = globalThis;

if (!globalForEmitter.__roomEmitter) {
    globalForEmitter.__roomEmitter = new EventEmitter();
    globalForEmitter.__roomEmitter.setMaxListeners(100);
}

export const roomEmitter = globalForEmitter.__roomEmitter;
