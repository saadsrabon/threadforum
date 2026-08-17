import Link from "next/link";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { emptyStates } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <PageShell>
      <AppHeader />
      <PageContent>
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-16 lg:px-6">
        <p className="mb-2 text-6xl font-bold text-primary/20">404</p>
        {emptyStates.notFound()}
        <Link href="/" className="mt-8 text-sm text-muted hover:text-primary">
          ← Return to ThreadSphere
        </Link>
        </main>
      </PageContent>
      <AppFooter />
    </PageShell>
  );
}
