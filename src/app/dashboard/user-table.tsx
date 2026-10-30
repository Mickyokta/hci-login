"use client";

import { useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";

type Row = { id: string; name: string; email: string; createdAt: string };

export function UserTable({ users, currentUserId }: { users: Row[]; currentUserId: string }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.includes(q))
    : users;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <h2 className="font-semibold">Daftar user</h2>
        <div className="relative w-full sm:w-72">
          <label htmlFor="search" className="sr-only">
            Cari user berdasarkan nama atau email
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" width={16} height={16} />
          <input
            id="search"
            type="search"
            placeholder="Cari nama atau email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${inputClass()} py-2 pl-9`}
          />
        </div>
      </div>

      <p className="sr-only" role="status">
        {q ? `${filtered.length} user cocok dengan pencarian` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="space-y-3 p-10 text-center">
          <p className="text-sm text-muted">
            Tidak ada user yang cocok dengan &ldquo;{query}&rdquo;.
          </p>
          <Button variant="secondary" onClick={() => setQuery("")}>
            <CloseIcon width={16} height={16} />
            Hapus pencarian
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">No</th>
                <th scope="col" className="px-4 py-3 font-medium">Nama</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium whitespace-nowrap">Tanggal daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u, i) => (
                <tr key={u.id} className={u.id === currentUserId ? "bg-primary-soft/60" : undefined}>
                  <td className="px-4 py-3 text-muted tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        Anda
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
