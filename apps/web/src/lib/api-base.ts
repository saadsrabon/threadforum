/** Browser calls go through the Next.js `/api` proxy for same-origin cookies. */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "/api";
  }

  return process.env.INTERNAL_API_URL ?? "http://localhost:4001";
}

/** Socket.io must connect directly to the API host (WebSockets are not proxied). */
export function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4001";
}
