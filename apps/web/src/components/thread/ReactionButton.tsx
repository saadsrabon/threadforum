"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ReactionButton({
  threadId,
  initialCount,
  initialReacted = false,
  size = "md",
}: {
  threadId: string;
  initialCount: number;
  initialReacted?: boolean;
  size?: "sm" | "md";
}) {
  const { requireAuth, loading: authLoading } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [reacted, setReacted] = useState(initialReacted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      const result = await apiFetch<{ reacted: boolean; reactionCount: number }>(
        `/threads/${threadId}/react`,
        { method: "POST" },
      );
      setReacted(result.reacted);
      setCount(result.reactionCount);
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
        "inline-flex items-center gap-2 rounded-full font-medium transition",
        size === "sm"
          ? "px-3 py-1.5 text-xs"
          : "px-4 py-2 text-sm",
        reacted
          ? "bg-primary-light text-primary"
          : "bg-zinc-100 text-foreground hover:bg-primary-light hover:text-primary",
      )}
    >
      <ThumbsUp className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {count}
    </button>
  );
}
