"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, Eye, Lock, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch, type ApiUser } from "@/lib/api";
import { cn } from "@/lib/utils";

type Tab = "profile" | "security";

export function AccountSettingsForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    avatarUrl: null as string | null,
    isPublic: true,
    username: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    apiFetch<{ user: ApiUser }>("/auth/me")
      .then(({ user }) => {
        setProfile({
          displayName: user.displayName,
          bio: user.bio ?? "",
          location: user.location ?? "",
          website: user.website ?? "",
          avatarUrl: user.avatarUrl ?? null,
          isPublic: user.isPublic ?? true,
          username: user.username,
          email: user.email,
        });
      })
      .catch(() => setError("Could not load account settings"))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        json: {
          displayName: profile.displayName,
          bio: profile.bio || null,
          location: profile.location || null,
          website: profile.website || null,
          avatarUrl: profile.avatarUrl,
          isPublic: profile.isPublic,
        },
      });
      await refresh();
      setMessage("Profile updated successfully.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        json: {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="flex gap-2 lg:flex-col">
        {(
          [
            { id: "profile" as const, label: "Profile", icon: User },
            { id: "security" as const, label: "Security", icon: Lock },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setError(null);
              setMessage(null);
            }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition",
              tab === id
                ? "bg-primary-light text-primary"
                : "text-muted hover:bg-zinc-100 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:p-8">
        {message && (
          <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
        )}
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {tab === "profile" && (
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <h2 className="text-xl font-bold">Profile settings</h2>
                <p className="mt-1 text-sm text-muted">
                  Update how you appear on your public profile.
                </p>
              </div>
              <Button
                href={`/u/${profile.username}`}
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View public profile
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display name">
                <input
                  value={profile.displayName}
                  onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Username">
                <input value={profile.username} className={inputClass} disabled />
              </Field>
            </div>

            <Field label="Email">
              <input value={profile.email} className={inputClass} disabled />
            </Field>

            <Field label="Bio">
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                rows={4}
                className={inputClass}
                placeholder="Tell the community about yourself…"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location">
                <input
                  value={profile.location}
                  onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  className={inputClass}
                  placeholder="City, Country"
                />
              </Field>
              <Field label="Website">
                <input
                  value={profile.website}
                  onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                  className={inputClass}
                  placeholder="https://yoursite.com"
                />
              </Field>
            </div>

            <div className="rounded-xl border border-border bg-zinc-50 p-4">
              <ImageUpload
                label="Profile photo"
                value={profile.avatarUrl}
                onChange={(url) => setProfile((p) => ({ ...p, avatarUrl: url }))}
                aspect="square"
                theme="light"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4">
              <input
                type="checkbox"
                checked={profile.isPublic}
                onChange={(e) => setProfile((p) => ({ ...p, isPublic: e.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              <div>
                <p className="font-medium">Public profile</p>
                <p className="text-sm text-muted">
                  Allow others to find your profile, follow you, and see your posts.
                </p>
              </div>
            </label>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        )}

        {tab === "security" && (
          <form onSubmit={changePassword} className="space-y-5">
            <div className="border-b border-border pb-5">
              <h2 className="text-xl font-bold">Change password</h2>
              <p className="mt-1 text-sm text-muted">
                Use a strong password with at least 8 characters, including a letter and a number.
              </p>
            </div>

            <Field label="Current password">
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                }
                className={inputClass}
                required
                minLength={8}
              />
            </Field>
            <Field label="New password">
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                className={inputClass}
                required
                minLength={8}
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                className={inputClass}
                required
                minLength={8}
              />
            </Field>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          Your public profile is at{" "}
          <Link href={`/u/${profile.username}`} className="text-primary hover:underline">
            threadsphere.com/u/{profile.username}
          </Link>
          <ExternalLink className="ml-1 inline h-3 w-3" />
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-zinc-50 disabled:text-muted";
