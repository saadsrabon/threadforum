import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell as LayoutShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

function SkeletonLayout({
  children,
  columns = "feed",
}: {
  children: React.ReactNode;
  columns?: "feed" | "two" | "profile" | "single";
}) {
  return (
    <LayoutShell>
      <AppHeader />
      <PageContent>
        <div
          className={
            columns === "feed"
              ? "mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:px-6"
              : columns === "profile"
                ? "mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)_300px] lg:px-6"
                : columns === "two"
                  ? "mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6"
                  : "mx-auto w-full max-w-3xl flex-1 px-4 py-8 lg:px-6"
          }
        >
          {children}
        </div>
      </PageContent>
      <AppFooter />
    </LayoutShell>
  );
}

export function HomePageSkeleton() {
  return (
    <SkeletonLayout columns="feed">
      <div className="hidden space-y-4 lg:block">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
      <main className="min-w-0 space-y-5">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-2xl" />
        ))}
      </main>
      <div className="hidden space-y-4 xl:block">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    </SkeletonLayout>
  );
}

export function CommunityPageSkeleton() {
  return (
    <LayoutShell>
      <AppHeader />
      <PageContent>
        <Skeleton className="h-40 w-full rounded-none" />
        <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6">
        <main className="min-w-0 space-y-4">
          <Skeleton className="h-10 w-64 rounded-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </main>
        <aside className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </aside>
        </div>
      </PageContent>
      <AppFooter />
    </LayoutShell>
  );
}

export function ThreadDetailSkeleton() {
  return (
    <SkeletonLayout columns="feed">
      <div className="hidden lg:block">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
      <main className="min-w-0 space-y-6">
        <Skeleton className="h-4 w-48" />
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-4 flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mb-4 h-10 w-3/4" />
          <Skeleton className="mb-6 h-4 w-1/2" />
          <Skeleton className="mb-3 h-4 w-full" />
          <Skeleton className="mb-3 h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-8 h-12 w-full rounded-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </main>
      <aside className="space-y-4">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </aside>
    </SkeletonLayout>
  );
}

export function ProfilePageSkeleton() {
  return (
    <SkeletonLayout columns="profile">
      <aside>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </aside>
      <main className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-2xl" />
        ))}
      </main>
      <aside className="space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </aside>
    </SkeletonLayout>
  );
}

export function SearchPageSkeleton() {
  return (
    <SkeletonLayout columns="feed">
      <aside>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </aside>
      <main className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </main>
      <div className="hidden xl:block">
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    </SkeletonLayout>
  );
}

export function BookmarksPageSkeleton() {
  return (
    <SkeletonLayout columns="single">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-2xl" />
        ))}
      </div>
    </SkeletonLayout>
  );
}

export function NotificationsPageSkeleton() {
  return (
    <SkeletonLayout columns="profile">
      <aside className="hidden lg:block">
        <Skeleton className="h-56 w-full rounded-2xl" />
      </aside>
      <main className="space-y-4">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </main>
      <aside>
        <Skeleton className="h-32 w-full rounded-2xl" />
      </aside>
    </SkeletonLayout>
  );
}

export function FormPageSkeleton() {
  return (
    <LayoutShell>
      <AppHeader />
      <PageContent>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 lg:px-6">
          <Skeleton className="mb-2 h-10 w-64" />
          <Skeleton className="mb-8 h-4 w-full max-w-md" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </main>
      </PageContent>
      <AppFooter />
    </LayoutShell>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1816] px-4">
      <Skeleton className="h-[520px] w-full max-w-md rounded-[2rem]" />
    </div>
  );
}
