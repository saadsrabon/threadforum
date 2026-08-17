import Link from "next/link";
import { MessageCircle, Pin, ThumbsUp } from "lucide-react";
import type { ApiThreadSummary } from "@/lib/api";
import { formatTimeAgo, initials } from "@/lib/api";
import { TagChip } from "@/components/ui/TagChip";
import { Avatar } from "@/components/ui/Avatar";

export function CommunityThreadListItem({
  thread,
  communitySlug,
  themeColor,
}: {
  thread: ApiThreadSummary;
  communitySlug: string;
  themeColor?: string | null;
}) {
  return (
    <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      {thread.pinned && (
        <span className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
          <Pin className="h-3 w-3" />
          Pinned
        </span>
      )}
      <div className="mb-2 flex flex-wrap gap-2">
        {thread.tags.map((tag) => (
          <TagChip
            key={tag.id}
            label={tag.name}
            href={`/search?tag=${tag.slug}`}
            color={themeColor ?? undefined}
          />
        ))}
      </div>
      <Link href={`/c/${communitySlug}/t/${thread.id}`}>
        <h3 className="mb-2 text-lg font-semibold hover:text-primary">{thread.title}</h3>
      </Link>
      <p className="mb-4 line-clamp-2 text-sm text-muted">{thread.excerpt}</p>
      <div className="flex items-center gap-2 text-sm text-muted">
        <Avatar initials={initials(thread.author.displayName)} size="sm" />
        <span className="font-medium text-foreground">{thread.author.displayName}</span>
        <span>·</span>
        <span>{formatTimeAgo(thread.createdAt)}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {thread.commentCount}
        </span>
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5" />
          {thread.reactionCount}
        </span>
      </div>
    </article>
  );
}
