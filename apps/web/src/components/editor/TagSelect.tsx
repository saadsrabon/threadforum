"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { apiFetch, type ApiTag } from "@/lib/api";
import { cn } from "@/lib/utils";

type TagSelectProps = {
  communityId?: string;
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
};

export function TagSelect({ communityId, value, onChange, max = 5 }: TagSelectProps) {
  const [tags, setTags] = useState<ApiTag[]>([]);
  const [knownTags, setKnownTags] = useState<Map<string, ApiTag>>(new Map());
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (communityId) params.set("communityId", communityId);

    apiFetch<{ tags: ApiTag[] }>(`/tags?${params}`)
      .then((data) => {
        setTags(data.tags);
        setKnownTags((prev) => {
          const next = new Map(prev);
          for (const tag of data.tags) next.set(tag.id, tag);
          return next;
        });
      })
      .catch(() => setTags([]));
  }, [query, communityId]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectedTags = value
    .map((id) => knownTags.get(id))
    .filter((tag): tag is ApiTag => Boolean(tag));
  const trimmedQuery = query.trim();
  const canCreate =
    trimmedQuery.length >= 2 &&
    !tags.some((t) => t.name.toLowerCase() === trimmedQuery.toLowerCase());

  function toggle(tagId: string) {
    setError(null);
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
      return;
    }
    if (value.length >= max) {
      setError(`You can select up to ${max} tags`);
      return;
    }
    onChange([...value, tagId]);
    const tag = knownTags.get(tagId) ?? tags.find((t) => t.id === tagId);
    if (tag) {
      setKnownTags((prev) => new Map(prev).set(tag.id, tag));
    }
    setQuery("");
  }

  async function createTag() {
    if (!canCreate || creating) return;
    if (value.length >= max) {
      setError(`You can select up to ${max} tags`);
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const result = await apiFetch<{ tag: ApiTag }>("/tags", {
        method: "POST",
        json: { name: trimmedQuery },
      });
      setTags((prev) => [result.tag, ...prev.filter((t) => t.id !== result.tag.id)]);
      setKnownTags((prev) => new Map(prev).set(result.tag.id, result.tag));
      onChange([...value, result.tag.id]);
      setQuery("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create tag");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="text-sm font-medium">Tags (1–{max} required)</label>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary"
            >
              {tag.name}
              <button type="button" onClick={() => toggle(tag.id)} aria-label={`Remove ${tag.name}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setError(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canCreate) {
              e.preventDefault();
              void createTag();
            }
          }}
          placeholder="Search or create tags…"
          className="h-10 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        {open && (tags.length > 0 || canCreate) && (
          <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-border bg-white py-1 shadow-lg">
            {canCreate && (
              <li>
                <button
                  type="button"
                  onClick={() => void createTag()}
                  disabled={creating}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary-light/40"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Create tag &quot;{trimmedQuery}&quot;
                </button>
              </li>
            )}
            {tags.map((tag) => (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => toggle(tag.id)}
                  className={cn(
                    "flex w-full px-3 py-2 text-left text-sm hover:bg-zinc-50",
                    value.includes(tag.id) && "bg-primary-light text-primary",
                  )}
                >
                  #{tag.slug}
                  <span className="ml-2 text-muted">{tag.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-muted">
        Type a new tag name and press Enter or choose &quot;Create tag&quot; to add it inline.
      </p>
    </div>
  );
}
