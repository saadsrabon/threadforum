"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Layers } from "lucide-react";
import { apiFetch, type ApiUser } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const redirect = searchParams.get("redirect") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      await apiFetch<{ user: ApiUser }>("/auth/login", {
        method: "POST",
        json: {
          identifier: form.get("identifier"),
          password: form.get("password"),
        },
      });
      await refresh();
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
        <h1 className="mt-6 text-3xl font-bold text-white">Log In</h1>
        <p className="mt-2 text-sm text-zinc-400">Sign in to access your communities</p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        {error && (
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
        )}

        <div>
          <label htmlFor="identifier" className="mb-2 block text-sm text-zinc-300">
            Email
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            placeholder="Email address or username"
            className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8b3030] focus:ring-2 focus:ring-[#8b3030]/30"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-zinc-300">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Enter your password"
              className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-4 pr-12 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#8b3030] focus:ring-2 focus:ring-[#8b3030]/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-[#8b3030] text-sm font-semibold text-white transition hover:bg-[#742828] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-zinc-500">
        Demo: demo@threadsphere.dev / Password1
      </p>

      <p className="mt-4 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-[#d46a6a] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
