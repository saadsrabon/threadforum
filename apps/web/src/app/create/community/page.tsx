import { CreateCommunityWizard } from "@/components/community/CreateCommunityWizard";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { PageContent, PageShell } from "@/components/layout/PageShell";

export default function CreateCommunityPage() {
  return (
    <PageShell className="bg-[#1a1816]">
      <div className="border-b border-white/10 bg-[#1a1816]/95">
        <AppHeader />
      </div>
      <PageContent>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-6">
        <h1 className="mb-2 text-3xl font-bold text-white">Create Community</h1>
        <p className="mb-8 text-zinc-400">
          Set up your community in a few steps. You&apos;ll be the founding moderator.
        </p>
        <CreateCommunityWizard />
        </main>
      </PageContent>
      <AppFooter />
    </PageShell>
  );
}
