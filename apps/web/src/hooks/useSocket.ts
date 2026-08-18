"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getSocketUrl } from "@/lib/api-base";

const SOCKET_URL = getSocketUrl();

let sharedSocket: Socket | null = null;

function getSocket() {
  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return sharedSocket;
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

export function joinUserRoom(userId: string) {
  getSocket().emit("join:user", userId);
}

export function joinThreadRoom(threadId: string) {
  getSocket().emit("join:thread", threadId);
}

export function useJoinUserRoom(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();
    const join = () => joinUserRoom(userId);

    join();
    socket.on("connect", join);

    return () => {
      socket.off("connect", join);
    };
  }, [userId]);
}
