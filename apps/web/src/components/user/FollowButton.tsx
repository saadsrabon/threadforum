"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";

type FollowContextValue = {
  following: boolean;
  loading: boolean;
  toggle: () => Promise<void>;
};

const FollowContext = createContext<FollowContextValue | null>(null);

export function FollowProvider({
  username,
  initialFollowing,
  children,
}: {
  username: string;
  initialFollowing: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  const toggle = useCallback(async () => {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      if (following) {
        await apiFetch(`/users/${username}/follow`, { method: "DELETE" });
        setFollowing(false);
      } else {
        await apiFetch(`/users/${username}/follow`, { method: "POST" });
        setFollowing(true);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [following, requireAuth, router, username]);

  const value = useMemo(
    () => ({ following, loading, toggle }),
    [following, loading, toggle],
  );

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
}

function useFollowContext() {
  return useContext(FollowContext);
}

export function FollowButton({
  username,
  initialFollowing,
  isSelf,
  className,
  size = "md",
}: {
  username: string;
  initialFollowing: boolean;
  isSelf: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const context = useFollowContext();
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  if (isSelf) return null;

  async function standaloneToggle() {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      if (following) {
        await apiFetch(`/users/${username}/follow`, { method: "DELETE" });
        setFollowing(false);
      } else {
        await apiFetch(`/users/${username}/follow`, { method: "POST" });
        setFollowing(true);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const isFollowing = context ? context.following : following;
  const isLoading = context ? context.loading : loading;
  const onToggle = context ? context.toggle : standaloneToggle;

  return (
    <Button
      variant={isFollowing ? "outline" : "primary"}
      onClick={() => void onToggle()}
      disabled={isLoading}
      className={className}
      size={size}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}

export function FollowStatusBanner({
  displayName,
  isSelf,
}: {
  displayName: string;
  isSelf: boolean;
}) {
  const context = useFollowContext();
  if (isSelf || !context) return null;

  if (context.following) {
    return (
      <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
        You&apos;re following {displayName}. Their new threads will appear in your feed.
      </p>
    );
  }

  return (
    <p className="mt-4 text-sm text-muted">
      Follow {displayName} to see their activity in your feed.
    </p>
  );
}

export function ConnectCard({
  displayName,
  isSelf,
}: {
  displayName: string;
  isSelf: boolean;
}) {
  const context = useFollowContext();
  if (isSelf || !context) return null;

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary-light p-4">
      <h2 className="mb-2 font-semibold text-primary">Connect</h2>
      {context.following ? (
        <p className="text-sm text-muted">
          You follow {displayName}. You&apos;ll see updates when they post new threads.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            Follow {displayName} to stay updated on their threads and community activity.
          </p>
          <Button
            className="w-full"
            onClick={() => void context.toggle()}
            disabled={context.loading}
          >
            Follow
          </Button>
        </>
      )}
    </section>
  );
}
