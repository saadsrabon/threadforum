import { cookies } from "next/headers";
import type { ApiUser } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

function cookieHeaderFromStore(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export async function getCurrentUser(): Promise<ApiUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: cookieHeaderFromStore(cookieStore) },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as { user: ApiUser };
    return data.user;
  } catch {
    return null;
  }
}

export async function getUserProfile(username: string) {
  const cookieStore = await cookies();

  try {
    const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}`, {
      headers: { Cookie: cookieHeaderFromStore(cookieStore) },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as {
      user: {
        id: string;
        username: string;
        displayName: string;
        bio: string | null;
        avatarUrl: string | null;
        location: string | null;
        website: string | null;
        isPublic: boolean;
        joinedAt: string;
        postCount: number;
        followerCount: number;
        followingCount: number;
        isFollowing: boolean;
        isSelf: boolean;
      };
      threads: Array<{
        id: string;
        title: string;
        excerpt: string;
        community: { name: string; slug: string; themeColor: string | null } | null;
        tags: Array<{ id: string; name: string; slug: string }>;
        commentCount: number;
        reactionCount: number;
        createdAt: string;
      }>;
      communities: Array<{
        id: string;
        name: string;
        slug: string;
        description: string;
        themeColor: string | null;
        memberCount: number;
      }>;
    };
  } catch {
    return null;
  }
}

export function loginUrl(redirectPath: string) {
  return `/login?redirect=${encodeURIComponent(redirectPath)}`;
}
