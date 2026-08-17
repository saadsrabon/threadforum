import { notFound, redirect } from "next/navigation";
import { ThreadDetailView } from "@/components/thread/ThreadDetailView";
import { getThread } from "@/lib/api";

type PageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function StandaloneThreadPage({ params }: PageProps) {
  const { threadId } = await params;
  const data = await getThread(threadId);

  if (!data) notFound();

  if (data.thread.community) {
    redirect(`/c/${data.thread.community.slug}/t/${threadId}`);
  }

  return <ThreadDetailView threadId={threadId} />;
}
