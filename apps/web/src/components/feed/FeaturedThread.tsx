import Link from "next/link";
import { MessageCircle, Pin, Share2, ThumbsUp } from "lucide-react";
import type { Thread } from "@/lib/mock-data";
import { threadPath } from "@/lib/thread-url";
import { TagChip } from "@/components/ui/TagChip";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export function FeaturedThread({
  thread,
  communitySlug,
}: {
  thread: Thread;
  communitySlug?: string;
}) {
  const href = threadPath({
    id: thread.id,
    community: communitySlug
      ? { name: thread.community, slug: communitySlug }
      : null,
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[220px] bg-gradient-to-br from-zinc-200 via-zinc-100 to-primary/20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80')] bg-cover bg-center opacity-90" />
        </div>
        <div className="flex flex-col justify-center p-6 md:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {communitySlug ? (
              <TagChip label={thread.community} color={thread.communityColor} />
            ) : (
              <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-muted">
                Personal post
              </span>
            )}
            {thread.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                <Pin className="h-3 w-3" />
                Pinned · Announcement
              </span>
            )}
          </div>
          <h2 className="mb-3 text-2xl font-bold leading-tight text-foreground">
            {thread.title}
          </h2>
          <p className="mb-4 line-clamp-3 text-sm text-muted">{thread.excerpt}</p>
          <div className="mb-5 flex items-center gap-3 text-sm text-muted">
            <Avatar initials={thread.authorInitials} size="sm" />
            <span className="font-medium text-foreground">{thread.author}</span>
            <span>·</span>
            <span>{thread.timeAgo}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {thread.comments}
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {thread.reactions}
            </span>
          </div>
          <Button href={href} size="lg" className="w-fit">
            View Thread
          </Button>
        </div>
      </div>
    </article>
  );
}
