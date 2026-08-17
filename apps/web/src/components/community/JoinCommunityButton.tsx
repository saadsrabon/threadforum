"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export function JoinCommunityButton({
  slug,
  initialJoined,
  size = "lg",
}: {
  slug: string;
  initialJoined: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [joined, setJoined] = useState(initialJoined);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      if (joined) {
        await apiFetch(`/communities/${slug}/join`, { method: "DELETE" });
        setJoined(false);
      } else {
        await apiFetch(`/communities/${slug}/join`, { method: "POST" });
        setJoined(true);
      }
      router.refresh();
    } catch {
      // auth or network
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size={size} variant={joined ? "outline" : "primary"} onClick={toggle} disabled={loading}>
      {joined ? "Joined" : "Join Community"}
    </Button>
  );
}
