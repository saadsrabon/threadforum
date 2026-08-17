"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { CommentComposer } from "@/components/thread/CommentComposer";
import { emptyStates } from "@/components/ui/EmptyState";
import { formatTimeAgo, initials } from "@/lib/api";

type Comment = {
  id: string;
  contentHtml: string;
  createdAt: string;
  author: { displayName: string };
  replies: Array<{
    id: string;
    contentHtml: string;
    createdAt: string;
    author: { displayName: string };
  }>;
};

export function ThreadComments({
  threadId,
  comments,
  commentCount,
}: {
  threadId: string;
  comments: Comment[];
  commentCount: number;
}) {
  const [replyTo, setReplyTo] = useState<string | null>(null);

  return (
    <section id="comments" className="scroll-mt-24 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Comments ({commentCount})</h2>

      <div className="mb-6">
        <CommentComposer threadId={threadId} />
      </div>

      <div className="space-y-6">
        {comments.length === 0 ? (
          emptyStates.comments()
        ) : (
          comments.map((comment) => (
          <div key={comment.id} className="border-b border-border pb-6 last:border-0">
            <div className="flex gap-3">
              <Avatar initials={initials(comment.author.displayName)} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2 text-sm">
                  <span className="font-medium">{comment.author.displayName}</span>
                  <span className="text-muted">{formatTimeAgo(comment.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="ml-auto text-xs font-medium text-primary hover:underline"
                  >
                    Reply
                  </button>
                </div>
                <div
                  className="prose prose-sm max-w-none text-muted"
                  dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
                />
                {replyTo === comment.id && (
                  <div className="mt-4">
                    <CommentComposer
                      threadId={threadId}
                      parentId={comment.id}
                      onSuccess={() => setReplyTo(null)}
                      placeholder="Write a reply…"
                    />
                  </div>
                )}
                {comment.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="mt-4 flex gap-3 border-l-2 border-border pl-4"
                  >
                    <Avatar initials={initials(reply.author.displayName)} size="sm" />
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-sm">
                        <span className="font-medium">{reply.author.displayName}</span>
                        <span className="text-muted">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-muted"
                        dangerouslySetInnerHTML={{ __html: reply.contentHtml }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </section>
  );
}
