"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { threadPath } from "@/lib/thread-url";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { TagSelect } from "@/components/editor/TagSelect";
import { Button } from "@/components/ui/Button";
import { CONTENT_LIMITS, TAG_LIMITS } from "@threadsphere/shared";

type Community = {
  id: string;
  name: string;
  slug: string;
};

export function CreateThreadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get("community");

  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityId, setCommunityId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ communities: Community[] }>("/communities")
      .then((data) => {
        setCommunities(data.communities);
        if (preselectedSlug) {
          const match = data.communities.find((c) => c.slug === preselectedSlug);
          if (match) setCommunityId(match.id);
        }
      })
      .catch(() => setError("Failed to load communities"));
  }, [preselectedSlug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (tagIds.length < TAG_LIMITS.minPerThread) {
      setError(`Select at least ${TAG_LIMITS.minPerThread} tag`);
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch<{
        thread: {
          id: string;
          communitySlug: string | null;
          community?: { slug: string } | null;
        };
      }>("/threads", {
        method: "POST",
        json: {
          ...(communityId ? { communityId } : { communityId: null }),
          title,
          content,
          tagIds,
        },
      });

      const path = threadPath({
        id: result.thread.id,
        community: result.thread.communitySlug
          ? { name: "", slug: result.thread.communitySlug }
          : null,
      });
      router.push(path);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create thread");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div>
        <label htmlFor="community" className="mb-2 block text-sm font-medium">
          Community <span className="font-normal text-muted">(optional)</span>
        </label>
        <select
          id="community"
          value={communityId}
          onChange={(e) => {
            setCommunityId(e.target.value);
            setTagIds([]);
          }}
          className="h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        >
          <option value="">Personal post — no community</option>
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">
          Post to a community or share as a personal thread on your profile and the home feed.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={CONTENT_LIMITS.threadTitleMin}
          maxLength={CONTENT_LIMITS.threadTitleMax}
          placeholder="A clear, descriptive title"
          className="h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        <p className="mt-1 text-xs text-muted">
          {CONTENT_LIMITS.threadTitleMin}–{CONTENT_LIMITS.threadTitleMax} characters
        </p>
      </div>

      <TagSelect
        communityId={communityId || undefined}
        value={tagIds}
        onChange={setTagIds}
      />

      <div>
        <label className="mb-2 block text-sm font-medium">Content</label>
        <RichTextEditor value={content} onChange={setContent} />
        <p className="mt-1 text-xs text-muted">
          Minimum {CONTENT_LIMITS.threadBodyMin} characters of text
        </p>
      </div>

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Publishing…" : "Publish thread"}
      </Button>
    </form>
  );
}
