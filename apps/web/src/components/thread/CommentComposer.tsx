"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";

type CommentComposerProps = {
  threadId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
};

export function CommentComposer({
  threadId,
  parentId,
  onSuccess,
  placeholder = "Add a comment…",
}: CommentComposerProps) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, requireAuth } = useAuth();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <div className="h-32 animate-pulse rounded-xl bg-zinc-100" />;
  }

  if (!isAuthenticated) {
    return <LoginPrompt compact={Boolean(parentId)} />;
  }

  async function submit() {
    if (!requireAuth()) return;
    if (!content.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await apiFetch(`/threads/${threadId}/comments`, {
        method: "POST",
        json: { content: content.trim(), ...(parentId ? { parentId } : {}) },
      });
      setContent("");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-zinc-50 p-4">
      {error && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={submit} disabled={loading || !content.trim()}>
          {loading ? "Posting…" : parentId ? "Reply" : "Post comment"}
        </Button>
      </div>
    </div>
  );
}
