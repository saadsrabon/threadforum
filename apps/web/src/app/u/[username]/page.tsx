import { notFound } from "next/navigation";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { PublicProfile } from "@/components/user/PublicProfile";
import { getUserProfile } from "@/lib/auth";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getUserProfile(username);

  if (!data) notFound();

  return (
    <PageShell>
      <AppHeader />
      <PageContent>
        <PublicProfile user={data.user} threads={data.threads} communities={data.communities} />
      </PageContent>
      <AppFooter />
    </PageShell>
  );
}
