import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  sessionDuration,
  signSession,
  verifySession,
} from "./session-token";

export async function createSession(userId: string, remember: boolean) {
  const token = await signSession({ userId }, remember);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // "Ingat saya" -> cookie bertahan 30 hari.
    // Tanpa centang -> cookie sesi, hilang saat browser ditutup.
    ...(remember ? { maxAge: sessionDuration(true) } : {}),
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
