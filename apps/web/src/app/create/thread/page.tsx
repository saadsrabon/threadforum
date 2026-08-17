import { Suspense } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { CreateThreadForm } from "@/components/thread/CreateThreadForm";
import { Skeleton } from "@/components/ui/Skeleton";

function CreateThreadFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-10 w-32 rounded-full" />
    </div>
  );
}

export default function CreateThreadPage() {
  return (
    <PageShell>
      <AppHeader />
      <PageContent>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 lg:px-6">
        <h1 className="mb-2 text-3xl font-bold">Create Thread</h1>
        <p className="mb-8 text-muted">
          Share your question, idea, or update with the community. Tags help others discover your post.
        </p>
        <Suspense fallback={<CreateThreadFormSkeleton />}>
          <CreateThreadForm />
        </Suspense>
        </main>
      </PageContent>
      <AppFooter />
    </PageShell>
  );
}
