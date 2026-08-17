export type ThreadCommunity = {
  name: string;
  slug: string;
  themeColor?: string | null;
  description?: string;
  rules?: unknown;
};

export function threadPath(
  thread: { id: string; community?: ThreadCommunity | null },
): string {
  return thread.community?.slug
    ? `/c/${thread.community.slug}/t/${thread.id}`
    : `/t/${thread.id}`;
}

export function threadLabel(community: ThreadCommunity | null | undefined): string {
  return community?.name ?? "Personal post";
}
