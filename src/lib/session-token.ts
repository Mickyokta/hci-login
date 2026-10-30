import { jwtVerify, SignJWT } from "jose";

// Modul ini tidak memakai API khusus server (cookies()) sehingga bisa
// dipakai bersama oleh src/proxy.ts dan src/lib/session.ts.

export const SESSION_COOKIE = "session";
export const REMEMBER_ME_DAYS = 30;
const DEFAULT_SESSION_HOURS = 12;

export type SessionPayload = {
  userId: string;
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET belum diatur atau kurang dari 32 karakter. Lihat .env.example.",
    );
  }
  return new TextEncoder().encode(secret);
}

export function sessionDuration(remember: boolean) {
  return remember
    ? REMEMBER_ME_DAYS * 24 * 60 * 60
    : DEFAULT_SESSION_HOURS * 60 * 60;
}

export async function signSession(payload: SessionPayload, remember: boolean) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionDuration(remember)}s`)
    .sign(getSecretKey());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return typeof payload.userId === "string" ? { userId: payload.userId } : null;
  } catch {
    return null;
  }
}
