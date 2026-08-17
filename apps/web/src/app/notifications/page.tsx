"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import {
  FILTER_LABELS,
  NotificationFeed,
  type NotificationFilter,
} from "@/components/notifications/NotificationFeed";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

const SIDEBAR_FILTERS: NotificationFilter[] = ["all", "REPLY", "MENTION", "FOLLOW"];

export default function NotificationsPage() {
  const { unreadCount, setUnreadCount, lastEventAt } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [refreshToken, setRefreshToken] = useState(0);

  async function markAllRead() {
    await apiFetch("/notifications/read-all", { method: "POST" });
    setUnreadCount(0);
    setRefreshToken((value) => value + 1);
  }

  return (
    <PageShell>
      <AppHeader />

      <PageContent>
        <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)_320px] lg:px-6">
        <aside className="hidden space-y-4 lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Categories</h2>
            <ul className="space-y-1 text-sm">
              {SIDEBAR_FILTERS.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`w-full rounded-lg px-3 py-2 text-left transition ${
                      filter === key
                        ? "bg-primary-light font-medium text-primary"
                        : "text-muted hover:bg-zinc-50 hover:text-foreground"
                    }`}
                  >
                    {FILTER_LABELS[key]}
                  </button>
                </li>
              ))}
            </ul>
            <Button className="mt-4 w-full" size="sm" onClick={() => void markAllRead()}>
              Mark all read
            </Button>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="mt-1 text-sm text-muted">
                Grouped by day, week, and month — scroll for older activity
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-white">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {SIDEBAR_FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                  filter === key
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-muted"
                }`}
              >
                {FILTER_LABELS[key]}
              </button>
            ))}
          </div>

          <NotificationFeed
            filter={filter}
            reloadKey={lastEventAt}
            refreshToken={refreshToken}
            onUnreadChange={setUnreadCount}
          />
        </main>

        <aside className="hidden space-y-4 xl:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              Notification settings
            </h2>
            <p className="text-sm text-muted">
              Email and push preferences will be configurable in a later phase.
            </p>
          </div>
        </aside>
        </div>
      </PageContent>

      <AppFooter />
    </PageShell>
  );
}
