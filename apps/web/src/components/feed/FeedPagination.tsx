"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function FeedPagination() {
  const [infinite, setInfinite] = useState(false);

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm sm:flex-row">
      <div className="flex items-center gap-1">
        {["Prev", "1", "2", "3", "Next"].map((label) => (
          <button
            key={label}
            type="button"
            className={cn(
              "min-w-9 rounded-full px-3 py-1.5 text-sm transition",
              label === "1"
                ? "bg-primary text-white"
                : "text-muted hover:bg-zinc-100 hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-muted">
          Infinite
          <button
            type="button"
            role="switch"
            aria-checked={infinite}
            onClick={() => setInfinite(!infinite)}
            className={cn(
              "relative h-6 w-11 rounded-full transition",
              infinite ? "bg-primary" : "bg-zinc-300",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                infinite ? "left-5" : "left-0.5",
              )}
            />
          </button>
        </label>
        <Button size="md">Load more</Button>
      </div>
    </div>
  );
}
