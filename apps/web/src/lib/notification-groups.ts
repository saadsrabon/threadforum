const GROUP_ORDER = ["today", "yesterday", "this_week", "this_month"] as const;

const GROUP_LABELS: Record<(typeof GROUP_ORDER)[number], string> = {
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This week",
  this_month: "This month",
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay();
  const diff = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - diff);
  return start;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthBucketKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getNotificationTimeGroup(createdAt: string, now = new Date()): string {
  const date = new Date(createdAt);
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= today) return "today";
  if (date >= yesterday) return "yesterday";
  if (date >= startOfWeek(now)) return "this_week";
  if (date >= startOfMonth(now)) return "this_month";
  return monthBucketKey(date);
}

export function getGroupLabel(key: string): string {
  if (key in GROUP_LABELS) {
    return GROUP_LABELS[key as keyof typeof GROUP_LABELS];
  }

  const match = /^(\d{4})-(\d{2})$/.exec(key);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    return new Date(year, month, 1).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }

  return key;
}

function compareGroupKeys(a: string, b: string) {
  const ai = GROUP_ORDER.indexOf(a as (typeof GROUP_ORDER)[number]);
  const bi = GROUP_ORDER.indexOf(b as (typeof GROUP_ORDER)[number]);
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;
  return b.localeCompare(a);
}

export function groupNotificationsByTime<T extends { createdAt: string }>(
  items: T[],
): Array<{ key: string; label: string; items: T[] }> {
  const map = new Map<string, T[]>();

  for (const item of items) {
    const key = getNotificationTimeGroup(item.createdAt);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }

  return [...map.entries()]
    .sort(([a], [b]) => compareGroupKeys(a, b))
    .map(([key, groupItems]) => ({
      key,
      label: getGroupLabel(key),
      items: groupItems,
    }));
}

export function formatNotificationTimestamp(createdAt: string, now = new Date()): string {
  const date = new Date(createdAt);
  const group = getNotificationTimeGroup(createdAt, now);
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (group === "today") return time;
  if (group === "yesterday") return `Yesterday at ${time}`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
