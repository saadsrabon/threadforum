import Link from "next/link";
import {
  activeCommunities,
  topContributors,
  trendingTags,
  upcomingEvents,
} from "@/lib/mock-data";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

function WidgetCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function RightRail() {
  return (
    <aside className="space-y-4">
      <WidgetCard title="Trending topics">
        <div className="flex flex-wrap gap-2">
          {trendingTags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/search?tag=${tag}`}
              className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-foreground hover:bg-primary-light hover:text-primary"
            >
              #{tag}
              <span className="ml-1 text-muted">{count}</span>
            </Link>
          ))}
        </div>
      </WidgetCard>

      <WidgetCard title="Active communities">
        <ul className="space-y-3">
          {activeCommunities.map((community) => (
            <li key={community.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: community.color }}
                >
                  {community.name.slice(0, 2)}
                </span>
                <span className="font-medium">{community.name}</span>
              </span>
              <span className="text-xs text-muted">{community.members}</span>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Top contributors">
        <ul className="space-y-3">
          {topContributors.map((contributor) => (
            <li key={contributor.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Avatar initials={contributor.initials} size="sm" />
                <span className="font-medium">{contributor.name}</span>
              </span>
              <span className="text-xs text-muted">{contributor.contributions}</span>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Upcoming events">
        <ul className="space-y-3">
          {upcomingEvents.map((event) => (
            <li
              key={event.id}
              className="rounded-xl border border-border p-3 text-sm"
            >
              <p className="font-medium">{event.title}</p>
              <p className="mt-1 text-xs text-muted">
                {event.date} · {event.time}
              </p>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="mt-3 w-full">
          View all events
        </Button>
      </WidgetCard>
    </aside>
  );
}
