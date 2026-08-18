import { getApiBaseUrl } from "./api-base";
import { isAuthRefreshPath, refreshAccessToken } from "./auth-session";

export type ApiUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  website?: string | null;
  isPublic?: boolean;
  createdAt: string;
};

export type ApiTag = {
  id: string;
  name: string;
  slug: string;
};

export type ApiThreadSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  pinned: boolean;
  viewCount: number;
  createdAt: string;
  author: { id: string; username: string; displayName: string };
  community?: { name: string; slug: string; themeColor: string | null } | null;
  tags: ApiTag[];
  commentCount: number;
  reactionCount: number;
};

import { formatApiError } from "./api-errors";

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as T;
}

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.json) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: "include",
    body: init?.json ? JSON.stringify(init.json) : init?.body,
  });
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  let res = await request(path, init);

  if (res.status === 401 && !isAuthRefreshPath(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await request(path, init);
    }
  }

  return parseJson<T>(res);
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  let res = await fetch(`${getApiBaseUrl()}/uploads/image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await fetch(`${getApiBaseUrl()}/uploads/image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
    }
  }

  const data = await parseJson<{ url: string }>(res);
  return data.url;
}

export async function getFeed() {
  try {
    return await apiFetch<{
      featured: {
        id: string;
        title: string;
        excerpt: string;
        pinned: boolean;
        createdAt: string;
        author: { displayName: string };
        community: { name: string; slug: string; themeColor: string | null } | null;
        tags: ApiTag[];
        commentCount: number;
        reactionCount: number;
      } | null;
      threads: Array<{
        id: string;
        title: string;
        excerpt: string;
        createdAt: string;
        author: { displayName: string };
        community: { name: string; slug: string; themeColor: string | null } | null;
        tags: ApiTag[];
        commentCount: number;
        reactionCount: number;
      }>;
    }>("/feed", { next: { revalidate: 30 } } as RequestInit);
  } catch {
    return null;
  }
}

export async function getUser(username: string) {
  try {
    return await apiFetch<{
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
        tags: ApiTag[];
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
    }>(`/users/${username}`, { next: { revalidate: 30 } } as RequestInit);
  } catch {
    return null;
  }
}

export async function getCommunity(slug: string) {
  try {
    return await apiFetch<{
      community: {
        id: string;
        name: string;
        slug: string;
        description: string;
        themeColor: string | null;
        coverUrl: string | null;
        iconUrl: string | null;
        rules: unknown;
        memberCount: number;
        threadCount: number;
        tags: ApiTag[];
        moderators: Array<{ username: string; displayName: string }>;
        isMember: boolean;
      };
      pinnedThreads: ApiThreadSummary[];
      threads: ApiThreadSummary[];
    }>(`/communities/${slug}`, { next: { revalidate: 60 } } as RequestInit);
  } catch {
    return null;
  }
}

export async function getThread(id: string) {
  try {
    return await apiFetch<{
      thread: {
        id: string;
        title: string;
        slug: string;
        contentHtml: string;
        pinned: boolean;
        viewCount: number;
        createdAt: string;
        author: ApiUser;
        community: {
          name: string;
          slug: string;
          description: string;
          themeColor: string | null;
          rules: unknown;
        } | null;
        tags: ApiTag[];
        commentCount: number;
        reactionCount: number;
        userReacted?: boolean;
        userBookmarked?: boolean;
        comments: Array<{
          id: string;
          contentHtml: string;
          createdAt: string;
          author: { username: string; displayName: string };
          reactionCount: number;
          replies: Array<{
            id: string;
            contentHtml: string;
            createdAt: string;
            author: { username: string; displayName: string };
          }>;
        }>;
      };
      relatedThreads: ApiThreadSummary[];
    }>(`/threads/${id}`, { cache: "no-store" } as RequestInit);
  } catch {
    return null;
  }
}

export function formatTimeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
