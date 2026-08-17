export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="text-xl font-bold text-[#C41E3A]">ThreadSphere</span>
          <nav className="flex gap-4 text-sm text-zinc-600">
            <a href="/login" className="hover:text-zinc-900">
              Log in
            </a>
            <a
              href="/register"
              className="rounded-full bg-[#C41E3A] px-4 py-2 font-medium text-white hover:bg-[#a81832]"
            >
              Sign up
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 shadow-sm">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-[#C41E3A]">
            Phase 1 — Foundation
          </p>
          <h1 className="mb-4 text-4xl font-bold text-zinc-900">
            Community forum platform
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-zinc-600">
            ThreadSphere is bootstrapped. Next up: auth, database, and the
            3-column feed layout from the UI mockups.
          </p>
          <div className="flex flex-wrap gap-3">
            <StatusPill label="Monorepo" done />
            <StatusPill label="Express + Socket.io" done />
            <StatusPill label="Shared validation" done />
            <StatusPill label="Auth & DB" done={false} />
            <StatusPill label="Feed layout" done={false} />
          </div>
          <p className="mt-8 text-sm text-zinc-500">
            Track progress in{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5">docs/PROGRESS.md</code>
          </p>
        </div>
      </main>
    </div>
  );
}

function StatusPill({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        done
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"
      }`}
    >
      {done ? "✓" : "○"} {label}
    </span>
  );
}
