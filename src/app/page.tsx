import { ButtonLink } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { getOptionalUser } from "@/lib/dal";
import { LandingTabs } from "./landing-tabs";

export default async function Home() {
  const user = await getOptionalUser().catch(() => null);

  return (
    <>
      <SiteHeader>
        {user ? (
          <ButtonLink href="/dashboard">Buka dashboard</ButtonLink>
        ) : (
          <>
            <ButtonLink href="/login" variant="ghost">
              Masuk
            </ButtonLink>
            <ButtonLink href="/register">Daftar</ButtonLink>
          </>
        )}
      </SiteHeader>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:py-24">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Autentikasi sederhana &amp; aman</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Login yang mudah, jelas, dan tersimpan aman di database.
          </h1>
          <p className="mt-4 text-lg text-muted text-pretty">
            Buat akun, masuk, dan kelola akses Anda dengan cepat tanpa langkah yang membingungkan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <ButtonLink href="/dashboard">Lihat daftar user</ButtonLink>
            ) : (
              <>
                <ButtonLink href="/register">Buat akun gratis</ButtonLink>
                <ButtonLink href="/login" variant="secondary">
                  Saya sudah punya akun
                </ButtonLink>
              </>
            )}
          </div>
        </section>

        <LandingTabs />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        Next.js · PostgreSQL (Neon) · Prisma
      </footer>
    </>
  );
}
