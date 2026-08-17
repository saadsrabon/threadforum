import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthPageSkeleton } from "@/components/skeletons/PageSkeletons";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1a1816] px-4">
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#8b3030]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full border border-[#8b3030]/30" />
      <Suspense fallback={<AuthPageSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
