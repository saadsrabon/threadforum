"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  threadId,
  initialBookmarked = false,
}: {
  threadId: string;
  initialBookmarked?: boolean;
}) {
  const { requireAuth, loading: authLoading } = useAuth();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      const result = await apiFetch<{ bookmarked: boolean }>(
        `/threads/${threadId}/bookmark`,
        { method: "POST" },
      );
      setBookmarked(result.bookmarked);
    } catch {
      // auth or network — leave state unchanged
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || authLoading}
      className={cn(
        "rounded-full p-2 transition hover:bg-zinc-100",
        bookmarked ? "text-primary" : "text-muted hover:text-foreground",
      )}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
    </button>
  );
}
