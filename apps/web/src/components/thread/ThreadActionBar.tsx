"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { ReactionButton } from "@/components/thread/ReactionButton";
import { BookmarkButton } from "@/components/thread/BookmarkButton";
import { ShareButton } from "@/components/ui/ShareButton";

export function ThreadActionBar({
  threadId,
  threadTitle,
  reactionCount,
  commentCount,
  userReacted = false,
  userBookmarked = false,
}: {
  threadId: string;
  threadTitle?: string;
  reactionCount: number;
  commentCount: number;
  userReacted?: boolean;
  userBookmarked?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
      <ReactionButton
        threadId={threadId}
        initialCount={reactionCount}
        initialReacted={userReacted}
      />
      <Link
        href="#comments"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary"
      >
        <MessageCircle className="h-4 w-4" />
        {commentCount} comments
      </Link>
      <BookmarkButton threadId={threadId} initialBookmarked={userBookmarked} />
      <ShareButton title={threadTitle} className="ml-auto" />
    </div>
  );
}
