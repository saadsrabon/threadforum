import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Bell,
  MessageCircle,
  Search,
  Sparkles,
  Users,
  FileText,
  Compass,
  Ghost,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  className?: string;
  variant?: "default" | "warm" | "cool" | "dark";
};

const variantStyles = {
  default: "from-zinc-50 to-white border-border",
  warm: "from-primary-light/40 to-white border-primary/20",
  cool: "from-blue-50/80 to-white border-blue-100",
  dark: "from-zinc-900 to-zinc-800 border-white/10 text-white",
};

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = "default",
}: EmptyStateProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-8 text-center shadow-sm sm:p-10",
        variantStyles[variant],
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/5" />

      <div
        className={cn(
          "relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl",
          isDark ? "bg-white/10" : "bg-primary-light",
        )}
      >
        <Icon className={cn("h-8 w-8", isDark ? "text-white" : "text-primary")} />
      </div>

      <h3 className={cn("relative text-lg font-semibold", isDark ? "text-white" : "text-foreground")}>
        {title}
      </h3>
      <p className={cn("relative mx-auto mt-2 max-w-sm text-sm", isDark ? "text-zinc-400" : "text-muted")}>
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && <Button href={action.href}>{action.label}</Button>}
          {secondaryAction && (
            <Button href={secondaryAction.href} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export const emptyStates = {
  feed: () => (
    <EmptyState
      icon={Compass}
      variant="warm"
      title="The feed is quiet… for now"
      description="Be the first to spark a conversation. Create a thread or explore communities to get things rolling."
      action={{ label: "Explore communities", href: "/search" }}
      secondaryAction={{ label: "Create thread", href: "/create/thread" }}
    />
  ),
  searchNoQuery: () => (
    <EmptyState
      icon={Search}
      title="What are you looking for?"
      description="Search threads, communities, and people across ThreadSphere. Try a topic, tag, or username."
    />
  ),
  searchNoResults: (query: string) => (
    <EmptyState
      icon={Ghost}
      variant="cool"
      title={`No matches for "${query}"`}
      description="Try different keywords, check spelling, or browse communities to discover related discussions."
      action={{ label: "Browse all", href: "/search" }}
    />
  ),
  bookmarks: () => (
    <EmptyState
      icon={Bookmark}
      variant="warm"
      title="Your reading list is empty"
      description="Save threads you want to revisit. Tap the bookmark icon on any post to stash it here."
      action={{ label: "Browse feed", href: "/" }}
    />
  ),
  notifications: (description?: string) => (
    <EmptyState
      icon={Bell}
      title="All caught up"
      description={
        description ??
        "When someone replies, follows you, or reacts to your posts, you'll see it here in real time."
      }
      action={{ label: "Explore threads", href: "/" }}
    />
  ),
  comments: () => (
    <EmptyState
      icon={MessageCircle}
      title="Start the conversation"
      description="No comments yet. Be the first to share your thoughts on this thread."
    />
  ),
  communityThreads: (slug: string) => (
    <EmptyState
      icon={FileText}
      variant="warm"
      title="No threads yet"
      description="This community is waiting for its first post. Break the ice with a question or announcement."
      action={{ label: "Create first thread", href: `/create/thread?community=${slug}` }}
    />
  ),
  profilePosts: () => (
    <EmptyState
      icon={Users}
      title="No posts yet"
      description="This user hasn't shared any threads. Check back later or explore other profiles."
      action={{ label: "Back to feed", href: "/" }}
    />
  ),
  notFound: () => (
    <EmptyState
      icon={Ghost}
      variant="dark"
      title="Page not found"
      description="This thread, community, or profile doesn't exist — or may have been moved."
      action={{ label: "Go home", href: "/" }}
      secondaryAction={{ label: "Search", href: "/search" }}
    />
  ),
  loginRequired: (redirect?: string) => (
    <EmptyState
      icon={Lock}
      variant="warm"
      title="Sign in to continue"
      description="You can browse freely, but you'll need an account to react, comment, bookmark, and join communities."
      action={{
        label: "Log in",
        href: redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login",
      }}
      secondaryAction={{ label: "Create account", href: "/register" }}
    />
  ),
};
