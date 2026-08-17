"use client";

import { useState } from "react";
import Link from "next/link";
import { communities } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const tabs = ["Only My", "Followed", "All"] as const;

export function CommunitySidebar() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Only My");

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Communities</h2>
          <Link href="/search" className="text-xs font-medium text-primary hover:underline">
            Manage
          </Link>
        </div>

        <div className="mb-4 flex gap-1 rounded-full bg-zinc-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition",
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <ul className="space-y-1">
          {communities.map((community) => (
            <li key={community.id}>
              <Link
                href={`/c/${community.slug}`}
                className="flex items-center justify-between rounded-xl px-2 py-2 text-sm hover:bg-zinc-50"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: community.color }}
                  />
                  <span className="font-medium">{community.name}</span>
                </span>
                <span className="text-xs text-muted">{community.threadCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <Button href="/create/thread" className="w-full" size="lg">
          Create Thread
        </Button>
        <Button href="/create/community" variant="outline" className="w-full" size="lg">
          Create Community
        </Button>
      </div>
    </aside>
  );
}
