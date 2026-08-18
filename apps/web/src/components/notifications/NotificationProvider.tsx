"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { SOCKET_EVENTS } from "@threadsphere/shared";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  playNotificationSound,
  unlockNotificationSound,
} from "@/lib/notification-sound";
import { useSocketEvent } from "@/hooks/useSocket";

type NotificationContextValue = {
  unreadCount: number;
  bellPulse: boolean;
  refreshUnread: () => Promise<void>;
  setUnreadCount: Dispatch<SetStateAction<number>>;
  lastEventAt: number;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellPulse, setBellPulse] = useState(false);
  const [lastEventAt, setLastEventAt] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await apiFetch<{ unreadCount: number }>("/notifications");
      setUnreadCount(data.unreadCount);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setBellPulse(false);
      return;
    }

    void refreshUnread();
  }, [user, refreshUnread]);

  useEffect(() => {
    const unlock = () => unlockNotificationSound();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useSocketEvent(
    SOCKET_EVENTS.notificationNew,
    () => {
      setUnreadCount((count) => count + 1);
      setLastEventAt(Date.now());
      setBellPulse(true);
      playNotificationSound();
      window.setTimeout(() => setBellPulse(false), 700);
    },
    Boolean(user),
  );

  const value = useMemo(
    () => ({
      unreadCount,
      bellPulse,
      refreshUnread,
      setUnreadCount,
      lastEventAt,
    }),
    [unreadCount, bellPulse, refreshUnread, lastEventAt],
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
