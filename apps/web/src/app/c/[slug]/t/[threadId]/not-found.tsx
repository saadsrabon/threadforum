import Link from "next/link";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { emptyStates } from "@/components/ui/EmptyState";

export default function ThreadNotFound() {
  return (
    <PageShell>
      <AppHeader />
      <PageContent>
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-16 lg:px-6">
          {emptyStates.notFound()}
          <Link href="/" className="mt-8 text-sm text-muted hover:text-primary">
            ← Back to feed
          </Link>
        </main>
      </PageContent>
      <AppFooter />
    </PageShell>
  );
}
