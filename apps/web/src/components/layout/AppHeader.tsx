"use client";

import Link from "next/link";
import { Bell, Bookmark, LogOut, Plus, Settings } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { initials } from "@/lib/api";
import { loginUrl } from "@/lib/auth-client";

export function AppHeader() {
  const { user, loading, logout, requireAuth } = useAuth();
  const { unreadCount, bellPulse } = useNotifications();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="shrink-0 text-xl font-bold text-primary">
          ThreadSphere
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/" className="font-medium text-foreground">
            Home
          </Link>
          <Link href="/search" className="hover:text-foreground">
            Communities
          </Link>
          <Link href="/search" className="hover:text-foreground">
            Explore
          </Link>
          {user && (
            <Link href="/bookmarks" className="hover:text-foreground">
              Bookmarks
            </Link>
          )}
        </nav>

        <SearchInput className="mx-auto hidden max-w-md flex-1 md:block" />

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {loading ? (
            <Skeleton className="h-9 w-32 rounded-full" />
          ) : user ? (
            <>
              <Button href="/create/community" size="sm" className="hidden sm:inline-flex">
                Create Community
              </Button>
              <Button href="/create/thread" size="sm" className="sm:hidden">
                <Plus className="h-4 w-4" />
              </Button>
              <Link
                href="/notifications"
                className="relative rounded-full p-2 text-muted hover:bg-zinc-100 hover:text-foreground"
                aria-label={
                  unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications"
                }
              >
                <Bell
                  className={`h-5 w-5 ${bellPulse ? "animate-bell-ring" : ""}`}
                />
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/bookmarks"
                className="hidden rounded-full p-2 text-muted hover:bg-zinc-100 hover:text-foreground sm:block"
                aria-label="Bookmarks"
              >
                <Bookmark className="h-5 w-5" />
              </Link>
              <Link href={`/u/${user.username}`} className="flex items-center gap-2">
                <Avatar initials={initials(user.displayName)} size="sm" />
                <span className="hidden text-sm font-medium lg:inline">{user.displayName}</span>
              </Link>
              <Link
                href="/settings"
                className="hidden rounded-full p-2 text-muted hover:bg-zinc-100 hover:text-foreground lg:block"
                aria-label="Account settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="hidden rounded-full p-2 text-muted hover:bg-zinc-100 hover:text-foreground lg:block"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:inline-flex"
                onClick={() => requireAuth("/create/community")}
              >
                Create Community
              </Button>
              <Button size="sm" href={loginUrl("/")}>
                Log in
              </Button>
              <Button size="sm" variant="outline" href="/register" className="hidden sm:inline-flex">
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
