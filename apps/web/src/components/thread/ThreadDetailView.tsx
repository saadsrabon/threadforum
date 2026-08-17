import Link from "next/link";
import { notFound } from "next/navigation";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { CommunitySidebar } from "@/components/layout/CommunitySidebar";
import { ThreadActionBar } from "@/components/thread/ThreadActionBar";
import { ThreadComments } from "@/components/thread/ThreadComments";
import { ThreadRealtime } from "@/components/thread/ThreadRealtime";
import { TagChip } from "@/components/ui/TagChip";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatTimeAgo, getThread, initials } from "@/lib/api";
import { threadLabel, threadPath } from "@/lib/thread-url";

type ThreadDetailViewProps = {
  threadId: string;
  communitySlug?: string;
};

export async function ThreadDetailView({ threadId, communitySlug }: ThreadDetailViewProps) {
  const data = await getThread(threadId);
  if (!data) notFound();

  const { thread, relatedThreads } = data;

  if (communitySlug) {
    if (!thread.community || thread.community.slug !== communitySlug) notFound();
  }

  const rules =
    thread.community && Array.isArray(thread.community.rules)
      ? (thread.community.rules as string[])
      : [];

  const tagColor = thread.community?.themeColor ?? undefined;

  return (
    <PageShell>
      <ThreadRealtime threadId={thread.id} />
      <AppHeader />

      <PageContent>
        <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:px-6">
        <div className="hidden lg:block">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              {thread.community ? (
                <>
                  <Link
                    href={`/c/${thread.community.slug}`}
                    className="text-sm font-semibold hover:text-primary"
                  >
                    ← {thread.community.name}
                  </Link>
                  {rules.length > 0 && (
                    <div className="mt-4">
                      <h2 className="mb-2 text-xs font-semibold uppercase text-muted">Rules</h2>
                      <ol className="list-decimal space-y-1 pl-4 text-xs text-muted">
                        {rules.slice(0, 3).map((rule) => (
                          <li key={rule}>{rule}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm font-semibold text-primary">Personal post</p>
              )}
            </div>
            <CommunitySidebar />
          </aside>
        </div>

        <main className="min-w-0 space-y-6">
          <nav className="text-sm text-muted">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            {thread.community ? (
              <>
                <span className="mx-2">/</span>
                <Link href={`/c/${thread.community.slug}`} className="hover:text-primary">
                  {thread.community.name}
                </Link>
              </>
            ) : (
              <>
                <span className="mx-2">/</span>
                <span>Personal post</span>
              </>
            )}
          </nav>

          <article className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {!thread.community && (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-muted">
                  Personal post
                </span>
              )}
              {thread.tags.map((tag) => (
                <TagChip
                  key={tag.id}
                  label={tag.name}
                  href={`/search?tag=${tag.slug}`}
                  color={tagColor}
                />
              ))}
            </div>

            <h1 className="mb-4 text-3xl font-bold leading-tight">{thread.title}</h1>

            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted">
              <Avatar initials={initials(thread.author.displayName)} />
              <Link
                href={`/u/${thread.author.username}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {thread.author.displayName}
              </Link>
              <span>·</span>
              <span>{formatTimeAgo(thread.createdAt)}</span>
              <span>·</span>
              <span>{thread.viewCount} views</span>
            </div>

            <div
              className="prose prose-zinc max-w-none text-[15px] leading-7"
              dangerouslySetInnerHTML={{ __html: thread.contentHtml }}
            />

            <ThreadActionBar
              threadId={thread.id}
              threadTitle={thread.title}
              reactionCount={thread.reactionCount}
              commentCount={thread.commentCount}
              userReacted={thread.userReacted}
              userBookmarked={thread.userBookmarked}
            />
          </article>

          <ThreadComments
            threadId={thread.id}
            comments={thread.comments}
            commentCount={thread.commentCount}
          />
        </main>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">About the author</h2>
            <div className="flex items-center gap-3">
              <Avatar initials={initials(thread.author.displayName)} />
              <div>
                <Link
                  href={`/u/${thread.author.username}`}
                  className="font-medium hover:text-primary"
                >
                  {thread.author.displayName}
                </Link>
                <p className="text-xs text-muted">@{thread.author.username}</p>
              </div>
            </div>
            {thread.author.bio && (
              <p className="mt-3 text-sm text-muted">{thread.author.bio}</p>
            )}
          </section>

          {thread.community ? (
            <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold">{thread.community.name}</h2>
              <p className="text-sm text-muted">{thread.community.description}</p>
              <Button
                href={`/c/${thread.community.slug}`}
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                Visit community
              </Button>
            </section>
          ) : (
            <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold">Personal post</h2>
              <p className="text-sm text-muted">
                This thread is not tied to a community. It appears on the home feed and the
                author&apos;s profile.
              </p>
              <Button
                href={`/u/${thread.author.username}`}
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                View profile
              </Button>
            </section>
          )}

          {relatedThreads.length > 0 && (
            <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">Related threads</h2>
              <ul className="space-y-3">
                {relatedThreads.map((related) => (
                  <li key={related.id}>
                    <Link
                      href={threadPath({
                        id: related.id,
                        community: related.community,
                      })}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {related.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {threadLabel(related.community)} ·{" "}
                      {related.commentCount} comments · {related.reactionCount} reactions
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
        </div>
      </PageContent>

      <AppFooter />
    </PageShell>
  );
}
