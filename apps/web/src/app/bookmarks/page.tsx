"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Compass, Trash2 } from "lucide-react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { TagChip } from "@/components/ui/TagChip";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { emptyStates } from "@/components/ui/EmptyState";
import { apiFetch, formatTimeAgo } from "@/lib/api";
import { threadPath } from "@/lib/thread-url";

const PERSONAL_FILTER = "__personal__";

type BookmarkItem = {
  id: string;
  createdAt: string;
  thread: {
    id: string;
    title: string;
    excerpt: string;
    community: { name: string; slug: string; themeColor: string | null } | null;
    author: { username: string; displayName: string };
    tags: Array<{ id: string; name: string; slug: string }>;
    commentCount: number;
    reactionCount: number;
  };
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    apiFetch<{ bookmarks: BookmarkItem[] }>("/bookmarks")
      .then((data) => setBookmarks(data.bookmarks))
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false));
  }, []);

  const communities = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>();
    for (const item of bookmarks) {
      const key = item.thread.community?.slug ?? PERSONAL_FILTER;
      const name = item.thread.community?.name ?? "Personal posts";
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { slug: key, name, count: 1 });
      }
    }
    return Array.from(map.values());
  }, [bookmarks]);

  const filtered =
    filter === "all"
      ? bookmarks
      : bookmarks.filter((b) =>
          filter === PERSONAL_FILTER
            ? !b.thread.community
            : b.thread.community?.slug === filter,
        );

  async function removeBookmark(threadId: string) {
    try {
      await apiFetch(`/threads/${threadId}/bookmark`, { method: "POST" });
      setBookmarks((items) => items.filter((b) => b.thread.id !== threadId));
    } catch {
      // ignore
    }
  }

  return (
    <PageShell>
      <AppHeader />

      <PageContent>
        <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:px-6">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Bookmark className="h-4 w-4 text-primary" />
              Collections
            </h2>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ) : (
              <ul className="space-y-1 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`w-full rounded-lg px-3 py-2 text-left ${
                      filter === "all" ? "bg-primary-light font-medium text-primary" : "text-muted hover:bg-zinc-50"
                    }`}
                  >
                    All saved ({bookmarks.length})
                  </button>
                </li>
                {communities.map((c) => (
                  <li key={c.slug}>
                    <button
                      type="button"
                      onClick={() => setFilter(c.slug)}
                      className={`w-full rounded-lg px-3 py-2 text-left ${
                        filter === c.slug
                          ? "bg-primary-light font-medium text-primary"
                          : "text-muted hover:bg-zinc-50"
                      }`}
                    >
                      {c.name} ({c.count})
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold">Saved threads</h1>
            <p className="mt-1 text-sm text-muted">
              Your personal reading list — bookmark threads from the feed or thread pages.
            </p>
          </div>

          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-36 w-full rounded-2xl" />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && emptyStates.bookmarks()}

          <ul className="space-y-4">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-zinc-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {item.thread.community ? (
                      <Link
                        href={`/c/${item.thread.community.slug}`}
                        className="text-xs font-medium text-primary"
                      >
                        {item.thread.community.name}
                      </Link>
                    ) : (
                      <span className="text-xs font-medium text-muted">Personal post</span>
                    )}
                    <Link
                      href={threadPath({
                        id: item.thread.id,
                        community: item.thread.community,
                      })}
                    >
                      <h2 className="mt-1 text-lg font-semibold hover:text-primary">
                        {item.thread.title}
                      </h2>
                    </Link>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{item.thread.excerpt}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.thread.tags.map((tag) => (
                        <TagChip key={tag.id} label={tag.name} />
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted">
                      by {item.thread.author.displayName} · {item.thread.commentCount} comments ·{" "}
                      {item.thread.reactionCount} reactions · saved {formatTimeAgo(item.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeBookmark(item.thread.id)}
                    className="rounded-full p-2 text-muted opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    aria-label="Remove bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </main>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Compass className="h-4 w-4" />
              Discover more
            </h2>
            <p className="mb-4 text-sm text-muted">
              Explore communities and save threads you want to read later.
            </p>
            <Button href="/" variant="outline" className="mb-2 w-full">
              Browse feed
            </Button>
            <Button href="/search" variant="outline" className="w-full">
              Search
            </Button>
          </section>
        </aside>
        </div>
      </PageContent>

      <AppFooter />
    </PageShell>
  );
}
