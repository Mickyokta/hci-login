import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSession } from "./session";

// Data Access Layer: satu-satunya tempat membaca user yang sedang login.

export const getOptionalUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true },
  });
});

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getOptionalUser();
  // Token valid tetapi user sudah tidak ada di database: bersihkan cookie.
  if (!user) redirect("/auth/clear");

  return user;
}

export async function listUsers() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });
}
