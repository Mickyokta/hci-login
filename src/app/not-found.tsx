import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-muted">
        Alamat yang Anda buka mungkin salah ketik atau halamannya sudah dipindahkan.
      </p>
      <div className="mt-3 flex gap-3">
        <ButtonLink href="/">Ke beranda</ButtonLink>
        <ButtonLink href="/bantuan" variant="secondary">
          Bantuan
        </ButtonLink>
      </div>
    </main>
  );
}
