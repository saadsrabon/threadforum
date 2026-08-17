import Link from "next/link";
import { Users } from "lucide-react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CommunityNotFound() {
  return (
    <PageShell>
      <AppHeader />
      <PageContent>
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 lg:px-6">
          <EmptyState
            icon={Users}
            variant="warm"
            title="Community not found"
            description="This community doesn't exist or may have been renamed. Double-check the URL or search for it."
            action={{ label: "Search communities", href: "/search" }}
            secondaryAction={{ label: "Go home", href: "/" }}
          />
          <Link href="/search" className="mt-8 block text-center text-sm text-muted hover:text-primary">
            ← Browse communities
          </Link>
        </main>
      </PageContent>
      <AppFooter />
    </PageShell>
  );
}
