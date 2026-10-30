"use client";

import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Terjadi kendala</h1>
      <p className="max-w-sm text-sm text-muted">
        Halaman ini gagal dimuat, kemungkinan karena server atau database sedang tidak dapat
        dihubungi. Coba muat ulang dalam beberapa saat.
      </p>
      <div className="mt-3 flex gap-3">
        <Button onClick={reset}>Coba lagi</Button>
        <ButtonLink href="/" variant="secondary">
          Ke beranda
        </ButtonLink>
      </div>
    </main>
  );
}
