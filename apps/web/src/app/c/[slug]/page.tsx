import Link from "next/link";
import { notFound } from "next/navigation";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { CommunityThreadListItem } from "@/components/community/CommunityThreadListItem";
import { JoinCommunityButton } from "@/components/community/JoinCommunityButton";
import { Button } from "@/components/ui/Button";
import { TagChip } from "@/components/ui/TagChip";
import { Avatar } from "@/components/ui/Avatar";
import { emptyStates } from "@/components/ui/EmptyState";
import { getCommunity } from "@/lib/api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CommunityPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCommunity(slug);

  if (!data) notFound();

  const { community, pinnedThreads, threads } = data;
  const rules = Array.isArray(community.rules) ? (community.rules as string[]) : [];

  return (
    <PageShell>
      <AppHeader />

      <PageContent>
        <div className="border-b border-border bg-white">
        {community.coverUrl && (
          <div className="h-40 w-full overflow-hidden bg-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={community.coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-8 lg:flex-row lg:items-center lg:px-6">
          {community.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={community.iconUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: community.themeColor ?? "#C41E3A" }}
            >
              {community.name.slice(0, 2)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{community.name}</h1>
            <p className="mt-2 max-w-2xl text-muted">{community.description}</p>
            <p className="mt-3 text-sm text-muted">
              {community.memberCount.toLocaleString()} members ·{" "}
              {community.threadCount.toLocaleString()} threads
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <JoinCommunityButton slug={slug} initialJoined={community.isMember} />
            <Button href={`/create/thread?community=${slug}`} size="lg">
              Create Thread
            </Button>
          </div>
        </div>
        </div>

      <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6">
        <main className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
            {["New", "Top", "Hot", "Unanswered"].map((tab, i) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  i === 0 ? "bg-primary text-white" : "text-muted hover:bg-zinc-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {pinnedThreads.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Pinned
              </h2>
              {pinnedThreads.map((thread) => (
                <CommunityThreadListItem
                  key={thread.id}
                  thread={thread}
                  communitySlug={slug}
                  themeColor={community.themeColor}
                />
              ))}
            </section>
          )}

          <section className="space-y-4">
            {threads.length === 0 && pinnedThreads.length === 0
              ? emptyStates.communityThreads(slug)
              : threads.map((thread) => (
                  <CommunityThreadListItem
                    key={thread.id}
                    thread={thread}
                    communitySlug={slug}
                    themeColor={community.themeColor}
                  />
                ))}
          </section>

          {threads.length > 0 && (
            <Button variant="outline" className="w-full">
              Load more threads
            </Button>
          )}
        </main>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold">About</h2>
            <p className="text-sm text-muted">{community.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {community.tags.map((tag) => (
                <TagChip key={tag.id} label={tag.name} href={`/search?tag=${tag.slug}`} />
              ))}
            </div>
          </section>

          {rules.length > 0 && (
            <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold">Community rules</h2>
              <ol className="list-decimal space-y-2 pl-4 text-sm text-muted">
                {rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ol>
            </section>
          )}

          {community.moderators.length > 0 && (
            <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">Moderators</h2>
              <ul className="space-y-2">
                {community.moderators.map((mod) => (
                  <li key={mod.username} className="flex items-center gap-2 text-sm">
                    <Avatar initials={mod.displayName.slice(0, 2).toUpperCase()} size="sm" />
                    <Link href={`/u/${mod.username}`} className="font-medium hover:text-primary">
                      {mod.displayName}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-primary/20 bg-primary-light p-4">
            <h2 className="mb-2 font-semibold text-primary">Ready to start a conversation?</h2>
            <p className="mb-4 text-sm text-muted">
              Share your ideas, ask questions, and connect with the community.
            </p>
            <Button href={`/create/thread?community=${slug}`} className="w-full">
              Create Thread
            </Button>
          </section>
        </aside>
      </div>
      </PageContent>

      <AppFooter />
    </PageShell>
  );
}
