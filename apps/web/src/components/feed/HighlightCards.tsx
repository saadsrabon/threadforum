import { Megaphone, Sparkles, Wrench } from "lucide-react";
import type { Highlight } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const icons = {
  announcement: Megaphone,
  update: Wrench,
  spotlight: Sparkles,
};

const labels = {
  announcement: "Announcement",
  update: "Update",
  spotlight: "Spotlight",
};

export function HighlightCards({ items }: { items: Highlight[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = icons[item.type];
        return (
          <article
            key={item.id}
            className="rounded-2xl border border-border bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl",
                  item.type === "announcement" && "bg-primary-light text-primary",
                  item.type === "update" && "bg-blue-50 text-blue-600",
                  item.type === "spotlight" && "bg-amber-50 text-amber-600",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {labels[item.type]}
              </span>
            </div>
            <h3 className="mb-1 text-sm font-semibold">{item.title}</h3>
            <p className="mb-2 line-clamp-2 text-xs text-muted">{item.description}</p>
            <p className="text-xs text-muted">{item.date}</p>
          </article>
        );
      })}
    </div>
  );
}
