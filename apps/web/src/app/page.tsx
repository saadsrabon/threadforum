import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { CommunitySidebar } from "@/components/layout/CommunitySidebar";
import { RightRail } from "@/components/layout/RightRail";
import { FeaturedThread } from "@/components/feed/FeaturedThread";
import { FeedPagination } from "@/components/feed/FeedPagination";
import { HighlightCards } from "@/components/feed/HighlightCards";
import { ThreadCard } from "@/components/feed/ThreadCard";
import { emptyStates } from "@/components/ui/EmptyState";
import { getFeed, formatTimeAgo, initials } from "@/lib/api";
import { featuredThread, feedThreads, highlights } from "@/lib/mock-data";
import type { Thread } from "@/lib/mock-data";

function mapFeedThread(
  t: NonNullable<Awaited<ReturnType<typeof getFeed>>>["threads"][number],
): Thread {
  return {
    id: t.id,
    title: t.title,
    excerpt: t.excerpt,
    community: t.community?.name ?? "Personal post",
    communitySlug: t.community?.slug,
    communityColor: t.community?.themeColor ?? "#71717a",
    author: t.author.displayName,
    authorInitials: initials(t.author.displayName),
    timeAgo: formatTimeAgo(t.createdAt),
    comments: t.commentCount,
    reactions: t.reactionCount,
  };
}

export default async function HomePage() {
  const feed = await getFeed();
  const apiUnavailable = feed === null;

  const featured: Thread & { communitySlug?: string } =
    feed?.featured
      ? {
          id: feed.featured.id,
          title: feed.featured.title,
          excerpt: feed.featured.excerpt,
          community: feed.featured.community?.name ?? "Personal post",
          communityColor: feed.featured.community?.themeColor ?? "#71717a",
          communitySlug: feed.featured.community?.slug,
          author: feed.featured.author.displayName,
          authorInitials: initials(feed.featured.author.displayName),
          timeAgo: formatTimeAgo(feed.featured.createdAt),
          comments: feed.featured.commentCount,
          reactions: feed.featured.reactionCount,
          pinned: feed.featured.pinned,
        }
      : featuredThread;

  const threads = apiUnavailable
    ? feedThreads
    : feed.threads.length > 0
      ? feed.threads.map(mapFeedThread)
      : [];

  const showEmptyFeed = !apiUnavailable && threads.length === 0;

  return (
    <PageShell>
      <AppHeader />

      <PageContent>
        <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:px-6">
        <div className="hidden lg:block">
          <CommunitySidebar />
        </div>

        <main className="min-w-0 space-y-5">
          <FeaturedThread thread={featured} communitySlug={featured.communitySlug} />
          <HighlightCards items={highlights} />
          {showEmptyFeed ? (
            emptyStates.feed()
          ) : (
            <div className="space-y-4">
              {threads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          )}
          {!showEmptyFeed && <FeedPagination />}
        </main>

        <div className="hidden xl:block">
          <RightRail />
        </div>
        </div>
      </PageContent>

      <AppFooter />
    </PageShell>
  );
}
