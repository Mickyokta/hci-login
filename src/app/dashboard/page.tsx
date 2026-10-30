import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { SiteHeader } from "@/components/site-header";
import { listUsers, requireUser } from "@/lib/dal";
import { UserTable } from "./user-table";

export const metadata: Metadata = { title: "Dashboard" };

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default async function DashboardPage() {
  const user = await requireUser();
  const users = await listUsers();

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: `${dateFormat.format(u.createdAt)} WIB`,
  }));

  return (
    <>
      <SiteHeader>
        <span className="hidden text-sm text-muted sm:inline">
          Masuk sebagai <strong className="font-medium text-foreground">{user.name}</strong>
        </span>
        <LogoutButton />
      </SiteHeader>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Halo, {user.name.split(" ")[0]}!</h1>
            <p className="mt-1 text-sm text-muted">
              Anda berhasil masuk sebagai {user.email}. Berikut daftar user yang tersimpan di database.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs text-muted">Total user terdaftar</p>
            <p className="text-2xl font-semibold tabular-nums">{users.length}</p>
          </div>
        </div>

        <UserTable users={rows} currentUserId={user.id} />

        <p className="text-xs text-muted">
          Data dibaca langsung dari tabel <code className="font-mono">users</code> di PostgreSQL setiap
          kali halaman dibuka. Password tidak ditampilkan karena disimpan sebagai hash bcrypt.{" "}
          <Link href="/bantuan" className="text-primary hover:underline">
            Pelajari lebih lanjut
          </Link>
        </p>
      </main>
    </>
  );
}
