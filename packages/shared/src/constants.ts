export const APP_NAME = "ThreadSphere";

export const TAG_LIMITS = {
  minPerThread: 1,
  maxPerThread: 5,
  maxPerCommunity: 10,
} as const;

export const CONTENT_LIMITS = {
  threadTitleMin: 10,
  threadTitleMax: 200,
  threadBodyMin: 50,
  threadBodyMax: 20_000,
  commentBodyMin: 1,
  commentBodyMax: 5_000,
} as const;

export const API_ROUTES = {
  health: "/health",
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  communities: "/communities",
  threads: "/threads",
  tags: "/tags",
  search: "/search",
  notifications: "/notifications",
} as const;

export const SOCKET_EVENTS = {
  notificationNew: "notification:new",
  notificationRead: "notification:read",
  threadComment: "thread:comment",
  threadReaction: "thread:reaction",
  messageSend: "message:send",
  presenceUpdate: "presence:update",
  joinUser: "join:user",
  joinThread: "join:thread",
} as const;

export const PHASES = [
  { id: 1, name: "Foundation", status: "in_progress" },
  { id: 2, name: "Communities & Threads", status: "pending" },
  { id: 3, name: "Feeds & Search", status: "pending" },
  { id: 4, name: "Realtime & Social", status: "pending" },
  { id: 5, name: "Polish", status: "pending" },
] as const;
