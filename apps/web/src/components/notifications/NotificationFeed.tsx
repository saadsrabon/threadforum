"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AtSign,
  Bell,
  Loader2,
  MessageSquare,
  Shield,
  UserPlus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { emptyStates } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api";
import {
  formatNotificationTimestamp,
  groupNotificationsByTime,
} from "@/lib/notification-groups";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type NotificationFilter = "all" | "REPLY" | "MENTION" | "FOLLOW";

const FILTER_LABELS: Record<NotificationFilter, string> = {
  all: "All",
  REPLY: "Replies",
  MENTION: "Mentions",
  FOLLOW: "Following",
};

type NotificationFeedProps = {
  filter: NotificationFilter;
  reloadKey: number;
  refreshToken?: number;
  onUnreadChange: React.Dispatch<React.SetStateAction<number>>;
};

function notificationIcon(type: string) {
  switch (type) {
    case "REPLY":
      return MessageSquare;
    case "MENTION":
      return AtSign;
    case "FOLLOW":
      return UserPlus;
    case "MODERATION":
      return Shield;
    default:
      return Bell;
  }
}

export function NotificationFeed({
  filter,
  reloadKey,
  refreshToken = 0,
  onUnreadChange,
}: NotificationFeedProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(
    async (nextCursor: string | null, append: boolean) => {
      const params = new URLSearchParams({ limit: "25" });
      if (filter !== "all") params.set("type", filter);
      if (nextCursor) params.set("cursor", nextCursor);

      const data = await apiFetch<{
        notifications: NotificationItem[];
        unreadCount: number;
        nextCursor: string | null;
      }>(`/notifications?${params}`);

      setNotifications((current) =>
        append ? [...current, ...data.notifications] : data.notifications,
      );
      onUnreadChange(data.unreadCount);
      setCursor(data.nextCursor);
      setHasMore(Boolean(data.nextCursor));
      setError(null);
      return data;
    },
    [filter, onUnreadChange],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        await fetchPage(null, false);
      } catch {
        if (!cancelled) setError("Could not load notifications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchPage, reloadKey, refreshToken]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading || loadingMore) return;

    let fetching = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || !cursor || fetching) return;

        fetching = true;
        setLoadingMore(true);
        fetchPage(cursor, true)
          .catch(() => setError("Could not load more notifications"))
          .finally(() => {
            fetching = false;
            setLoadingMore(false);
          });
      },
      { root: node.parentElement, rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, fetchPage, hasMore, loading, loadingMore]);

  const grouped = useMemo(
    () => groupNotificationsByTime(notifications),
    [notifications],
  );

  async function markRead(id: string) {
    const target = notifications.find((item) => item.id === id);
    if (!target || target.read) return;

    try {
      await apiFetch(`/notifications/${id}/read`, { method: "POST" });
      setNotifications((items) =>
        items.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
      onUnreadChange((count) => Math.max(0, count - 1));
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    const label = FILTER_LABELS[filter].toLowerCase();
    return emptyStates.notifications(
      filter === "all"
        ? undefined
        : `No ${label} notifications yet. Activity will show up here when it happens.`,
    );
  }

  return (
    <div className="notification-scroll flex max-h-[calc(100vh-11rem)] min-h-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth">
        {grouped.map((group) => (
          <section key={group.key} aria-label={group.label}>
            <h2 className="sticky top-0 z-10 border-b border-border bg-white/95 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted backdrop-blur supports-[backdrop-filter]:bg-white/80">
              {group.label}
              <span className="ml-2 font-normal normal-case tracking-normal text-muted/80">
                ({group.items.length})
              </span>
            </h2>

            <ul className="divide-y divide-border">
              {group.items.map((notification) => {
                const Icon = notificationIcon(notification.type);
                const content = (
                  <>
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        notification.read ? "bg-zinc-100 text-muted" : "bg-primary-light text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className={`font-medium ${notification.read ? "text-foreground" : "text-foreground"}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                        )}
                      </div>
                      {notification.body && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted">{notification.body}</p>
                      )}
                      <p className="mt-2 text-xs text-muted">
                        {formatNotificationTimestamp(notification.createdAt)}
                      </p>
                    </div>
                  </>
                );

                const className = `flex gap-3 px-5 py-4 transition hover:bg-zinc-50 ${
                  notification.read ? "bg-white" : "bg-primary-light/15"
                }`;

                if (notification.link) {
                  return (
                    <li key={notification.id}>
                      <Link
                        href={notification.link}
                        className={className}
                        onClick={() => {
                          if (!notification.read) void markRead(notification.id);
                        }}
                      >
                        {content}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      className={`${className} w-full text-left`}
                      onClick={() => {
                        if (!notification.read) void markRead(notification.id);
                      }}
                    >
                      {content}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <div ref={sentinelRef} className="h-1" aria-hidden />

        {loadingMore && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more…
          </div>
        )}

        {!hasMore && notifications.length > 0 && (
          <p className="py-4 text-center text-xs text-muted">You&apos;re all caught up</p>
        )}
      </div>
    </div>
  );
}

export { FILTER_LABELS };
