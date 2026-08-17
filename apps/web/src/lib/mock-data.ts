export type Community = {
  id: string;
  name: string;
  slug: string;
  color: string;
  threadCount: number;
};

export type Thread = {
  id: string;
  title: string;
  excerpt: string;
  community: string;
  communitySlug?: string;
  communityColor: string;
  author: string;
  authorInitials: string;
  timeAgo: string;
  comments: number;
  reactions: number;
  pinned?: boolean;
};

export type Highlight = {
  id: string;
  type: "announcement" | "update" | "spotlight";
  title: string;
  description: string;
  date: string;
};

export type TrendingTag = {
  tag: string;
  count: string;
};

export type Contributor = {
  name: string;
  initials: string;
  contributions: number;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
};

export const communities: Community[] = [
  { id: "1", name: "Product Design", slug: "product-design", color: "#C41E3A", threadCount: 24 },
  { id: "2", name: "Web Development", slug: "web-development", color: "#2563EB", threadCount: 46 },
  { id: "3", name: "Data Science", slug: "data-science", color: "#16A34A", threadCount: 17 },
  { id: "4", name: "Product Marketing", slug: "product-marketing", color: "#EA580C", threadCount: 9 },
  { id: "5", name: "AI & ML", slug: "ai-ml", color: "#9333EA", threadCount: 32 },
];

export const featuredThread: Thread = {
  id: "featured-1",
  title: "Design Critique: Improving onboarding flows for early users",
  excerpt:
    "We're reviewing first-run experiences across mobile and web. Share screenshots, friction points, and ideas for reducing time-to-value in the first session.",
  community: "Product Design",
  communityColor: "#C41E3A",
  author: "Maya Lin",
  authorInitials: "ML",
  timeAgo: "2h ago",
  comments: 128,
  reactions: 340,
  pinned: true,
};

export const highlights: Highlight[] = [
  {
    id: "h1",
    type: "announcement",
    title: "Community guidelines refresh",
    description: "Updated moderation policy effective next week.",
    date: "Aug 14",
  },
  {
    id: "h2",
    type: "update",
    title: "New thread tagging tools",
    description: "Tag suggestions and filters are now live.",
    date: "Aug 15",
  },
  {
    id: "h3",
    type: "spotlight",
    title: "Contributor of the month",
    description: "Congrats to Aisha Khan for 120+ helpful replies.",
    date: "Aug 16",
  },
];

export const feedThreads: Thread[] = [
  {
    id: "t1",
    title: "Best practices for API rate limiting in Node.js",
    excerpt:
      "Sharing patterns we use for Express middleware, Redis token buckets, and graceful degradation under load.",
    community: "Web Development",
    communityColor: "#2563EB",
    author: "Ethan Cole",
    authorInitials: "EC",
    timeAgo: "4h ago",
    comments: 32,
    reactions: 218,
  },
  {
    id: "t2",
    title: "Feature store vs. batch pipelines for ML in production",
    excerpt:
      "When does a feature store pay off? Comparing latency, freshness, and team overhead for mid-size teams.",
    community: "Data Science",
    communityColor: "#16A34A",
    author: "Priya Sharma",
    authorInitials: "PS",
    timeAgo: "6h ago",
    comments: 19,
    reactions: 94,
  },
  {
    id: "t3",
    title: "Positioning frameworks for developer tools",
    excerpt:
      "How do you message a technical product without drowning in jargon? A lightweight template for early GTM.",
    community: "Product Marketing",
    communityColor: "#EA580C",
    author: "Jonas Reed",
    authorInitials: "JR",
    timeAgo: "8h ago",
    comments: 11,
    reactions: 67,
  },
  {
    id: "t4",
    title: "Fine-tuning vs. RAG for domain-specific assistants",
    excerpt:
      "Trade-offs we saw shipping an internal copilot for support workflows — accuracy, cost, and maintenance.",
    community: "AI & ML",
    communityColor: "#9333EA",
    author: "Lena Ortiz",
    authorInitials: "LO",
    timeAgo: "11h ago",
    comments: 44,
    reactions: 156,
  },
];

export const trendingTags: TrendingTag[] = [
  { tag: "onboarding", count: "1.2k" },
  { tag: "a11y", count: "890" },
  { tag: "mlops", count: "756" },
  { tag: "uxresearch", count: "612" },
  { tag: "designsystems", count: "540" },
];

export const activeCommunities = [
  { name: "Design Systems", members: "12.4k", color: "#C41E3A" },
  { name: "Frontend Guild", members: "8.9k", color: "#2563EB" },
  { name: "ML Practitioners", members: "6.2k", color: "#9333EA" },
];

export const topContributors: Contributor[] = [
  { name: "Aisha Khan", initials: "AK", contributions: 412 },
  { name: "Diego Marquez", initials: "DM", contributions: 388 },
  { name: "Hannah Lee", initials: "HL", contributions: 351 },
];

export const upcomingEvents: Event[] = [
  {
    id: "e1",
    title: "Growth Experiments Workshop",
    date: "Aug 22",
    time: "2:00 PM",
  },
  {
    id: "e2",
    title: "Fireside: Scaling Community Moderation",
    date: "Aug 28",
    time: "5:30 PM",
  },
];
