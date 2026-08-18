import type { Socket } from "socket.io";
import { verifySocketToken } from "./jwt.js";

declare module "socket.io" {
  interface SocketData {
    userId?: string;
  }
}

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
) {
  const token = socket.handshake.auth?.token;

  if (!token || typeof token !== "string") {
    return next();
  }

  try {
    const payload = verifySocketToken(token);
    socket.data.userId = payload.sub;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}

export function onSocketConnection(socket: Socket) {
  if (socket.data.userId) {
    void socket.join(`user:${socket.data.userId}`);
  }

  socket.on("join:thread", (threadId: string) => {
    if (typeof threadId === "string" && threadId.length > 0) {
      void socket.join(`thread:${threadId}`);
    }
  });
}
