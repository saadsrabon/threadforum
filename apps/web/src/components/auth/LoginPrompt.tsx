"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { emptyStates } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export function LoginPrompt({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  if (loading) {
    return compact ? (
      <Skeleton className="h-24 w-full rounded-xl" />
    ) : (
      <Skeleton className="h-40 w-full rounded-2xl" />
    );
  }

  return emptyStates.loginRequired(pathname);
}
