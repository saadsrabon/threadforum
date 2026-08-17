"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SOCKET_EVENTS } from "@threadsphere/shared";
import { joinThreadRoom, useSocketEvent } from "@/hooks/useSocket";

export function ThreadRealtime({ threadId }: { threadId: string }) {
  const router = useRouter();

  useEffect(() => {
    joinThreadRoom(threadId);
  }, [threadId]);

  useSocketEvent(
    SOCKET_EVENTS.threadComment,
    (payload) => {
      const data = payload as { threadId?: string };
      if (data.threadId === threadId) {
        router.refresh();
      }
    },
    Boolean(threadId),
  );

  useSocketEvent(
    SOCKET_EVENTS.threadReaction,
    (payload) => {
      const data = payload as { threadId?: string };
      if (data.threadId === threadId) {
        router.refresh();
      }
    },
    Boolean(threadId),
  );

  return null;
}
