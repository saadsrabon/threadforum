import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";

export type TokenPayload = {
  sub: string;
  username: string;
  email: string;
};

type SocketTokenPayload = TokenPayload & {
  purpose: "socket";
};

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

/** Short-lived token for Socket.io handshake (not stored in cookies). */
export function signSocketToken(payload: TokenPayload) {
  const socketPayload: SocketTokenPayload = { ...payload, purpose: "socket" };
  return jwt.sign(socketPayload, JWT_SECRET, { expiresIn: "5m" });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}

export function verifySocketToken(token: string): TokenPayload {
  const payload = jwt.verify(token, JWT_SECRET) as SocketTokenPayload;
  if (payload.purpose !== "socket") {
    throw new Error("Invalid socket token");
  }
  return {
    sub: payload.sub,
    username: payload.username,
    email: payload.email,
  };
}

export const SOCKET_TOKEN_TTL_SECONDS = 5 * 60;

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const accessCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
