import { getApiBaseUrl } from "./api-base";

const AUTH_REFRESH_PATH = "/auth/refresh";

/** Refresh access token ~1 minute before the 15-minute expiry. */
export const ACCESS_TOKEN_REFRESH_INTERVAL_MS = 14 * 60 * 1000;

let refreshPromise: Promise<boolean> | null = null;

export function isAuthRefreshPath(path: string): boolean {
  const normalized = path.split("?")[0] ?? path;
  return (
    normalized === AUTH_REFRESH_PATH ||
    normalized === "/auth/login" ||
    normalized === "/auth/register" ||
    normalized === "/auth/logout"
  );
}

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}${AUTH_REFRESH_PATH}`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
