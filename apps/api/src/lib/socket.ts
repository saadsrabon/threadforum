import type { Server } from "socket.io";
import { SOCKET_EVENTS } from "@threadsphere/shared";

let io: Server | null = null;

export function setSocketServer(server: Server) {
  io = server;
}

export function getSocketServer() {
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function emitToThread(threadId: string, event: string, payload: unknown) {
  io?.to(`thread:${threadId}`).emit(event, payload);
}

export function emitThreadComment(threadId: string, payload: unknown) {
  emitToThread(threadId, SOCKET_EVENTS.threadComment, payload);
}

export function emitThreadReaction(threadId: string, payload: unknown) {
  emitToThread(threadId, SOCKET_EVENTS.threadReaction, payload);
}

export function emitNotification(userId: string, payload: unknown) {
  emitToUser(userId, SOCKET_EVENTS.notificationNew, payload);
}
