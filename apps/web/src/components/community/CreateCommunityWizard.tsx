"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TagSelect } from "@/components/editor/TagSelect";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const STEPS = ["Details", "Appearance", "Rules", "Privacy", "Preview"] as const;

const MOD_PRESETS = {
  balanced: [
    "Be respectful and constructive",
    "Stay on topic",
    "No spam or self-promotion",
  ],
  strict: [
    "Zero tolerance for harassment",
    "All posts require relevant tags",
    "No external links without context",
    "Moderators may remove off-topic content",
  ],
  open: ["Keep it civil", "Assume good intent"],
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  tagIds: string[];
  themeColor: string;
  coverUrl: string | null;
  iconUrl: string | null;
  rules: string[];
  moderationPreset: keyof typeof MOD_PRESETS;
  customRules: string;
  privacy: "public" | "restricted" | "private";
};

const initialState: FormState = {
  name: "",
  slug: "",
  description: "",
  tagIds: [],
  themeColor: "#C41E3A",
  coverUrl: null,
  iconUrl: null,
  rules: MOD_PRESETS.balanced,
  moderationPreset: "balanced",
  customRules: "",
  privacy: "public",
};

export function CreateCommunityWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && typeof value === "string") {
        next.slug = slugify(value);
      }
      if (key === "moderationPreset") {
        next.rules = MOD_PRESETS[value as keyof typeof MOD_PRESETS];
      }
      return next;
    });
  }

  async function submit() {
    setError(null);
    setLoading(true);
    const custom = form.customRules
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);
    const rules = [...form.rules, ...custom];

    try {
      const result = await apiFetch<{ community: { slug: string } }>("/communities", {
        method: "POST",
        json: {
          name: form.name,
          slug: form.slug,
          description: form.description,
          tagIds: form.tagIds,
          privacy: form.privacy,
          themeColor: form.themeColor,
          coverUrl: form.coverUrl ?? undefined,
          iconUrl: form.iconUrl ?? undefined,
          rules,
        },
      });
      router.push(`/c/${result.community.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create community");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-2xl border border-white/10 bg-[#2e2a28] p-6 text-white shadow-xl lg:p-8">
        <div className="mb-8 flex gap-2">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= step ? "bg-[#8b3030]" : "bg-white/10",
              )}
            />
          ))}
        </div>

        <p className="mb-1 text-xs uppercase tracking-wide text-zinc-400">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="mb-6 text-2xl font-bold">{STEPS[step]}</h2>

        {error && (
          <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <Field label="Community name">
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
                placeholder="Indie Game Developers"
              />
            </Field>
            <Field label="URL slug">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span>threadsphere.com/c/</span>
                <input
                  value={form.slug}
                  onChange={(e) => update("slug", slugify(e.target.value))}
                  className={inputClass}
                />
              </div>
            </Field>
            <Field label="Short description">
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className={inputClass}
              />
            </Field>
            <TagSelect value={form.tagIds} onChange={(ids) => update("tagIds", ids)} max={10} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Field label="Theme color">
              <div className="flex gap-3">
                {["#C41E3A", "#2563EB", "#16A34A", "#9333EA", "#EA580C"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update("themeColor", color)}
                    className={cn(
                      "h-10 w-10 rounded-full border-2",
                      form.themeColor === color ? "border-white" : "border-transparent",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </Field>
            <ImageUpload
              label="Cover image"
              value={form.coverUrl}
              onChange={(url) => update("coverUrl", url)}
              aspect="banner"
            />
            <ImageUpload
              label="Community icon"
              value={form.iconUrl}
              onChange={(url) => update("iconUrl", url)}
              aspect="square"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(MOD_PRESETS) as Array<keyof typeof MOD_PRESETS>).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update("moderationPreset", key)}
                  className={cn(
                    "rounded-xl border p-4 text-left text-sm capitalize",
                    form.moderationPreset === key
                      ? "border-[#8b3030] bg-[#8b3030]/20"
                      : "border-white/10",
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
            <Field label="Custom rules (one per line)">
              <textarea
                value={form.customRules}
                onChange={(e) => update("customRules", e.target.value)}
                rows={4}
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            {(["public", "restricted", "private"] as const).map((p) => (
              <label
                key={p}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 capitalize",
                  form.privacy === p ? "border-[#8b3030] bg-[#8b3030]/20" : "border-white/10",
                )}
              >
                <input
                  type="radio"
                  name="privacy"
                  checked={form.privacy === p}
                  onChange={() => update("privacy", p)}
                />
                {p}
              </label>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="rounded-xl border border-white/10 bg-black/20 p-6">
            {form.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.coverUrl}
                alt=""
                className="mb-4 h-24 w-full rounded-xl object-cover"
              />
            ) : (
              <div
                className="mb-4 h-24 rounded-xl"
                style={{ backgroundColor: form.themeColor }}
              />
            )}
            <h3 className="text-xl font-bold">{form.name || "Community name"}</h3>
            <p className="mt-2 text-sm text-zinc-400">{form.description}</p>
            <p className="mt-4 text-xs text-zinc-500">/{form.slug}</p>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-zinc-300 hover:bg-white/10 hover:text-white"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={loading}>
              {loading ? "Creating…" : "Create Community"}
            </Button>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#2e2a28] p-5 text-white">
          <h3 className="mb-3 text-sm font-semibold">Live preview</h3>
          {form.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.coverUrl}
              alt=""
              className="mb-3 h-16 w-full rounded-xl object-cover"
            />
          ) : (
            <div
              className="mb-3 h-16 rounded-xl"
              style={{ backgroundColor: form.themeColor }}
            />
          )}
          <p className="font-semibold">{form.name || "Community"}</p>
          <p className="mt-1 line-clamp-3 text-sm text-zinc-400">
            {form.description || "Description preview"}
          </p>
          <Button size="sm" className="mt-4 w-full" variant="outline">
            Join
          </Button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#2e2a28] p-5 text-sm text-zinc-400">
          <h3 className="mb-2 font-semibold text-white">Setup suggestions</h3>
          <ul className="space-y-2">
            <li>• Pin a welcome thread after creating</li>
            <li>• Invite moderators from profile search</li>
            <li>• Add community tags for discoverability</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#8b3030]";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}
