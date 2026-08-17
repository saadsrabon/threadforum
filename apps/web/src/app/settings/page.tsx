import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContent, PageShell } from "@/components/layout/PageShell";
import { AccountSettingsForm } from "@/components/settings/AccountSettingsForm";

export default function SettingsPage() {
  return (
    <PageShell>
      <AppHeader />
      <PageContent>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 lg:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Account settings</h1>
          <p className="mt-2 text-muted">
            Manage your profile, privacy, and security. Your public profile is what others see when
            they connect with you.
          </p>
        </div>
        <AccountSettingsForm />
        </main>
      </PageContent>
      <AppFooter />
    </PageShell>
  );
}
