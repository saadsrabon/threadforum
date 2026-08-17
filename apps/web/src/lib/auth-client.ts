export function loginUrl(redirectPath: string) {
  return `/login?redirect=${encodeURIComponent(redirectPath)}`;
}
