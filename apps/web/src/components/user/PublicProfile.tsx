"use client";

import Link from "next/link";
import { Bookmark, MessageCircle, Settings, ThumbsUp } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  ConnectCard,
  FollowButton,
  FollowProvider,
  FollowStatusBanner,
} from "@/components/user/FollowButton";
import { ShareButton } from "@/components/ui/ShareButton";
import { Button } from "@/components/ui/Button";
import { TagChip } from "@/components/ui/TagChip";
import { Avatar } from "@/components/ui/Avatar";
import { emptyStates } from "@/components/ui/EmptyState";
import { formatTimeAgo, initials } from "@/lib/api";
import { threadPath } from "@/lib/thread-url";

type PublicProfileProps = {
  user: {
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    location: string | null;
    website: string | null;
    isPublic: boolean;
    joinedAt: string;
    postCount: number;
    followerCount: number;
    followingCount: number;
    isFollowing: boolean;
    isSelf: boolean;
  };
  threads: Array<{
    id: string;
    title: string;
    excerpt: string;
    community: { name: string; slug: string; themeColor: string | null } | null;
    tags: Array<{ id: string; name: string; slug: string }>;
    commentCount: number;
    reactionCount: number;
    createdAt: string;
  }>;
  communities: Array<{
    id: string;
    name: string;
    slug: string;
    memberCount: number;
  }>;
};

export function PublicProfile({ user, threads, communities }: PublicProfileProps) {
  const { user: sessionUser } = useAuth();
  const isSelf =
    user.isSelf ||
    sessionUser?.username.toLowerCase() === user.username.toLowerCase();

  return (
    <FollowProvider username={user.username} initialFollowing={user.isFollowing}>
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-white to-white">
        <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-5">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <Avatar initials={initials(user.displayName)} size="lg" className="h-24 w-24 text-2xl" />
              )}
              <div>
                <p className="text-sm font-medium text-primary">Public profile</p>
                <h1 className="text-3xl font-bold">{user.displayName}</h1>
                <p className="text-muted">@{user.username}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isSelf ? (
                <>
                  <Button href="/settings" variant="outline" className="inline-flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Edit profile
                  </Button>
                  <Button href="/bookmarks" variant="outline" className="inline-flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    My bookmarks
                  </Button>
                </>
              ) : (
                <FollowButton
                  username={user.username}
                  initialFollowing={user.isFollowing}
                  isSelf={false}
                />
              )}
            </div>
          </div>

          {isSelf && (
            <p className="mt-4 rounded-xl bg-primary-light/60 px-4 py-3 text-sm text-primary">
              This is how others see you on ThreadSphere. Update your bio and photo in{" "}
              <Link href="/settings" className="font-medium underline">
                account settings
              </Link>
              .
            </p>
          )}

          <FollowStatusBanner displayName={user.displayName} isSelf={isSelf} />
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)_300px] lg:px-6">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-xl font-bold">{user.postCount}</p>
                <p className="text-muted">Posts</p>
              </div>
              <div>
                <p className="text-xl font-bold">{user.followerCount}</p>
                <p className="text-muted">Followers</p>
              </div>
              <div>
                <p className="text-xl font-bold">{user.followingCount}</p>
                <p className="text-muted">Following</p>
              </div>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-muted">
              {user.location && <li>{user.location}</li>}
              {user.website && (
                <li>
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {user.website.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              )}
              <li>
                Joined{" "}
                {new Date(user.joinedAt).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </li>
            </ul>
          </section>
        </aside>

        <main className="min-w-0 space-y-5">
          {user.bio ? (
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-2 font-semibold">About</h2>
              <p className="leading-relaxed text-muted">{user.bio}</p>
            </section>
          ) : (
            !isSelf && (
              <section className="rounded-2xl border border-dashed border-border bg-zinc-50 p-6 text-sm text-muted">
                {user.displayName} hasn&apos;t added a bio yet.
              </section>
            )
          )}

          <section>
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-semibold">Posts</h2>
              <span className="text-xs text-muted">Newest</span>
            </div>

            <div className="space-y-4">
              {threads.length === 0
                ? emptyStates.profilePosts()
                : threads.map((thread) => {
                    const threadUrl = threadPath({
                      id: thread.id,
                      community: thread.community,
                    });
                    return (
                      <article
                        key={thread.id}
                        className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-zinc-300"
                      >
                        {thread.community ? (
                          <Link
                            href={`/c/${thread.community.slug}`}
                            className="text-xs font-medium text-primary"
                          >
                            {thread.community.name}
                          </Link>
                        ) : (
                          <span className="text-xs font-medium text-muted">Personal post</span>
                        )}
                        <Link href={threadUrl}>
                          <h3 className="mt-1 text-lg font-semibold hover:text-primary">
                            {thread.title}
                          </h3>
                        </Link>
                        <p className="mt-2 line-clamp-2 text-sm text-muted">{thread.excerpt}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {thread.tags.map((tag) => (
                            <TagChip key={tag.id} label={tag.name} />
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                          <Link
                            href={`${threadUrl}#comments`}
                            className="inline-flex items-center gap-1 hover:text-primary"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            {thread.commentCount} comments
                          </Link>
                          <span className="inline-flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {thread.reactionCount}
                          </span>
                          <span>{formatTimeAgo(thread.createdAt)}</span>
                          <ShareButton url={threadUrl} title={thread.title} size="sm" className="ml-auto" />
                        </div>
                      </article>
                    );
                  })}
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Communities</h2>
            {communities.length === 0 ? (
              <p className="text-sm text-muted">Not a member of any communities yet.</p>
            ) : (
              <ul className="space-y-3">
                {communities.map((c) => (
                  <li key={c.id}>
                    <Link href={`/c/${c.slug}`} className="font-medium hover:text-primary">
                      {c.name}
                    </Link>
                    <p className="text-xs text-muted">{c.memberCount} members</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <ConnectCard displayName={user.displayName} isSelf={isSelf} />
        </aside>
      </div>
    </FollowProvider>
  );
}
