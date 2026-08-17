import Link from "next/link";
import { MessageCircle, Share2 } from "lucide-react";
import type { Thread } from "@/lib/mock-data";
import { threadPath } from "@/lib/thread-url";
import { TagChip } from "@/components/ui/TagChip";
import { ReactionButton } from "@/components/thread/ReactionButton";
import { BookmarkButton } from "@/components/thread/BookmarkButton";
import { Avatar } from "@/components/ui/Avatar";

export function ThreadCard({ thread }: { thread: Thread }) {
  const href = threadPath({
    id: thread.id,
    community: thread.communitySlug
      ? { name: thread.community, slug: thread.communitySlug }
      : null,
  });

  return (
    <article className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-zinc-300">
      <div className="mb-3">
        {thread.communitySlug ? (
          <TagChip
            label={thread.community}
            color={thread.communityColor}
            href={`/c/${thread.communitySlug}`}
          />
        ) : (
          <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-muted">
            Personal post
          </span>
        )}
      </div>

      <Link href={href}>
        <h3 className="mb-2 text-lg font-semibold leading-snug hover:text-primary">
          {thread.title}
        </h3>
      </Link>

      <p className="mb-4 line-clamp-2 text-sm text-muted">{thread.excerpt}</p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Avatar initials={thread.authorInitials} size="sm" />
          <span className="font-medium text-foreground">{thread.author}</span>
          <span>·</span>
          <span>{thread.timeAgo}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {thread.comments}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ReactionButton
            threadId={thread.id}
            initialCount={thread.reactions}
            size="sm"
          />
          <BookmarkButton threadId={thread.id} />
          <button
            type="button"
            className="rounded-full p-2 text-muted hover:bg-zinc-100"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
