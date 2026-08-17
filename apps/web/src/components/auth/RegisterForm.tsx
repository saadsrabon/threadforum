"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Layers } from "lucide-react";
import { apiFetch, type ApiUser } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      await apiFetch<{ user: ApiUser }>("/auth/register", {
        method: "POST",
        json: {
          displayName: form.get("displayName"),
          username: form.get("username"),
          email: form.get("email"),
          password: form.get("password"),
        },
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#2e2a28]/90 p-8 shadow-2xl backdrop-blur">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8b3030] text-white">
          <Layers className="h-6 w-6" />
        </div>
        <p className="text-lg font-semibold text-white">ThreadSphere</p>
        <h1 className="mt-6 text-3xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Join communities and start meaningful discussions
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {error && (
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
        )}

        {[
          { id: "displayName", label: "Display name", placeholder: "Your name" },
          { id: "username", label: "Username", placeholder: "username" },
          { id: "email", label: "Email", placeholder: "you@example.com", type: "email" },
          { id: "password", label: "Password", placeholder: "Min 8 chars, letter + number", type: "password" },
        ].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="mb-2 block text-sm text-zinc-300">
              {field.label}
            </label>
            <input
              id={field.id}
              name={field.id}
              type={field.type ?? "text"}
              required
              minLength={field.id === "password" ? 8 : undefined}
              placeholder={field.placeholder}
              className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8b3030] focus:ring-2 focus:ring-[#8b3030]/30"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-full bg-[#8b3030] text-sm font-semibold text-white transition hover:bg-[#742828] disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#d46a6a] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
