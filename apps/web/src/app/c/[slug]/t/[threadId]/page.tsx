import { notFound } from "next/navigation";
import { ThreadDetailView } from "@/components/thread/ThreadDetailView";

type PageProps = {
  params: Promise<{ slug: string; threadId: string }>;
};

export default async function CommunityThreadPage({ params }: PageProps) {
  const { slug, threadId } = await params;
  return <ThreadDetailView threadId={threadId} communitySlug={slug} />;
}
