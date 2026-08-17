import Link from "next/link";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { RightRail } from "@/components/layout/RightRail";
import { Button } from "@/components/ui/Button";
import { TagChip } from "@/components/ui/TagChip";
import { Avatar } from "@/components/ui/Avatar";
import { emptyStates } from "@/components/ui/EmptyState";
import { initials } from "@/lib/api";
import { threadLabel, threadPath } from "@/lib/thread-url";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; tag?: string; sort?: string }>;
};

async function search(query: { q?: string; tag?: string; sort?: string }) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.tag) params.set("tag", query.tag);
  if (query.sort) params.set("sort", query.sort);

  const res = await fetch(`${API_URL}/search?${params}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    query: string;
    results: {
      threads: Array<{
        type: "thread";
        id: string;
        title: string;
        excerpt: string;
        community: { name: string; slug: string; themeColor: string | null } | null;
        author: { displayName: string };
        tags: Array<{ name: string; slug: string }>;
        commentCount: number;
        reactionCount: number;
      }>;
      communities: Array<{
        type: "community";
        slug: string;
        name: string;
        description: string;
        themeColor: string | null;
        memberCount: number;
      }>;
      users: Array<{
        type: "user";
        username: string;
        displayName: string;
        bio: string | null;
      }>;
    };
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q ?? params.tag ?? "";
  const data = q ? await search(params) : null;
  const totalResults = data
    ? data.results.threads.length +
      data.results.communities.length +
      data.results.users.length
    : 0;

  return (
    <PageShell>
      <AppHeader />

      <PageContent>
        <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:px-6">
        <aside className="space-y-4">
          <form action="/search" method="get" className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Filters</h2>
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search threads, communities…"
              className="mb-3 h-10 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary"
            />
            <input
              name="tag"
              defaultValue={params.tag}
              placeholder="Tag slug (e.g. ux)"
              className="mb-3 h-10 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary"
            />
            <select
              name="sort"
              defaultValue={params.sort ?? "relevance"}
              className="mb-3 h-10 w-full rounded-xl border border-border px-3 text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="new">New</option>
              <option value="top">Top</option>
            </select>
            <Button type="submit" className="w-full">
              Apply filters
            </Button>
          </form>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold">
              {q ? `"${q}"` : "Search ThreadSphere"}
            </h1>
            {data && (
              <p className="mt-1 text-sm text-muted">
                {data.results.threads.length} threads · {data.results.communities.length}{" "}
                communities · {data.results.users.length} users
              </p>
            )}
          </div>

          {!q && emptyStates.searchNoQuery()}

          {q && data && totalResults === 0 && emptyStates.searchNoResults(q)}

          {data?.results.communities.map((c) => (
            <article
              key={c.slug}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm"
            >
              <TagChip label="Community" />
              <Link href={`/c/${c.slug}`} className="mt-2 block text-lg font-semibold hover:text-primary">
                {c.name}
              </Link>
              <p className="mt-2 text-sm text-muted">{c.description}</p>
              <p className="mt-2 text-xs text-muted">{c.memberCount} members</p>
              <Button href={`/c/${c.slug}`} variant="outline" size="sm" className="mt-3">
                Visit
              </Button>
            </article>
          ))}

          {data?.results.threads.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex flex-wrap gap-2">
                {t.tags.map((tag) => (
                  <TagChip key={tag.slug} label={tag.name} href={`/search?tag=${tag.slug}`} />
                ))}
              </div>
              <Link
                href={threadPath({ id: t.id, community: t.community })}
                className="text-lg font-semibold hover:text-primary"
              >
                {t.title}
              </Link>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{t.excerpt}</p>
              <p className="mt-3 text-xs text-muted">
                {t.author.displayName} · {threadLabel(t.community)} · {t.commentCount} comments
              </p>
              <Button
                href={threadPath({ id: t.id, community: t.community })}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Open
              </Button>
            </article>
          ))}

          {data?.results.users.map((u) => (
            <article
              key={u.username}
              className="flex items-center justify-between rounded-2xl border border-border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Avatar initials={initials(u.displayName)} />
                <div>
                  <p className="font-medium">{u.displayName}</p>
                  <p className="text-sm text-muted">@{u.username}</p>
                  {u.bio && <p className="mt-1 text-sm text-muted">{u.bio}</p>}
                </div>
              </div>
              <Button href={`/u/${u.username}`} variant="outline" size="sm">
                Follow
              </Button>
            </article>
          ))}
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
