"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { apiFetch } from "@/lib/api";
import { getSocketUrl } from "@/lib/api-base";

const SOCKET_URL = getSocketUrl();

/** Refresh socket token ~1 minute before the 5-minute expiry. */
const SOCKET_TOKEN_REFRESH_INTERVAL_MS = 4 * 60 * 1000;

let sharedSocket: Socket | null = null;
let authenticatePromise: Promise<Socket | null> | null = null;

function createAnonymousSocket(): Socket {
  sharedSocket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ["websocket", "polling"],
  });
  return sharedSocket;
}

export function getSocket(): Socket {
  if (!sharedSocket) {
    return createAnonymousSocket();
  }
  return sharedSocket;
}

export function disconnectSocket() {
  if (sharedSocket) {
    sharedSocket.disconnect();
    sharedSocket = null;
  }
  authenticatePromise = null;
}

export async function authenticateSocket(): Promise<Socket | null> {
  if (authenticatePromise) {
    return authenticatePromise;
  }

  authenticatePromise = (async () => {
    try {
      const { token } = await apiFetch<{ token: string; expiresIn: number }>(
        "/auth/socket-token",
      );

      if (sharedSocket) {
        sharedSocket.auth = { token };
        if (sharedSocket.connected) {
          sharedSocket.disconnect().connect();
        } else {
          sharedSocket.connect();
        }
      } else {
        sharedSocket = io(SOCKET_URL, {
          auth: { token },
          autoConnect: true,
          transports: ["websocket", "polling"],
        });
      }

      return sharedSocket;
    } catch {
      disconnectSocket();
      return null;
    } finally {
      authenticatePromise = null;
    }
  })();

  return authenticatePromise;
}

export function useSocketAuth(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    void authenticateSocket();

    const interval = window.setInterval(() => {
      void authenticateSocket();
    }, SOCKET_TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [isAuthenticated]);
}

export function useSocketEvent(
  event: string,
  handler: (payload: unknown) => void,
  enabled = true,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();
    const listener = (payload: unknown) => handlerRef.current(payload);
    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [event, enabled]);
}

export function joinThreadRoom(threadId: string) {
  const socket = getSocket();

  const join = () => {
    socket.emit("join:thread", threadId);
  };

  if (socket.connected) {
    join();
  }

  socket.on("connect", join);

  return () => {
    socket.off("connect", join);
  };
}
