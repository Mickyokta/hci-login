import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { PASSWORD_RULES } from "@/lib/validation";

export const metadata: Metadata = { title: "Bantuan" };

const ADMIN_EMAIL = "admin@hci-login.app";

const FAQ = [
  {
    id: "lupa-password",
    q: "Saya lupa password. Apa yang harus dilakukan?",
    a: (
      <>
        <p>
          Demi keamanan, password disimpan dalam bentuk terenkripsi (hash) sehingga tidak bisa
          dilihat siapa pun, termasuk admin. Untuk memulihkan akun:
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Coba lagi dengan memastikan Caps Lock tidak aktif dan ejaan email sudah benar.</li>
          <li>
            Hubungi admin di{" "}
            <a href={`mailto:${ADMIN_EMAIL}`} className="text-primary hover:underline">
              {ADMIN_EMAIL}
            </a>{" "}
            dari email yang terdaftar untuk meminta reset password.
          </li>
          <li>
            Atau{" "}
            <Link href="/register" className="text-primary hover:underline">
              daftar akun baru
            </Link>{" "}
            dengan email lain.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: "aturan-password",
    q: "Apa syarat password yang diterima?",
    a: (
      <ul className="list-disc space-y-1 pl-5">
        {PASSWORD_RULES.map((rule) => (
          <li key={rule.id}>{rule.label}</li>
        ))}
        <li>Maksimal 72 karakter</li>
      </ul>
    ),
  },
  {
    id: "gagal-masuk",
    q: "Kenapa muncul pesan “Email atau password salah”?",
    a: (
      <p>
        Email belum terdaftar atau password tidak cocok. Kami sengaja tidak menyebutkan mana yang
        salah agar orang lain tidak bisa menebak email siapa saja yang terdaftar. Periksa kembali
        keduanya, atau gunakan tombol ikon mata untuk melihat password yang Anda ketik.
      </p>
    ),
  },
  {
    id: "ingat-saya",
    q: "Apa fungsi “Ingat saya”?",
    a: (
      <p>
        Jika dicentang, Anda tetap masuk selama 30 hari di browser tersebut. Jika tidak, Anda
        otomatis keluar saat browser ditutup. Jangan centang di komputer umum atau milik orang lain.
      </p>
    ),
  },
  {
    id: "data",
    q: "Di mana data saya disimpan?",
    a: (
      <p>
        Nama, email, dan hash password disimpan di database PostgreSQL. Setelah masuk, Anda dapat
        melihat daftar user yang terdaftar di halaman Dashboard.
      </p>
    ),
  },
];

export default function HelpPage() {
  return (
    <>
      <SiteHeader>
        <ButtonLink href="/login" variant="ghost">
          Masuk
        </ButtonLink>
        <ButtonLink href="/register">Daftar</ButtonLink>
      </SiteHeader>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted hover:text-foreground"
        >
          <ArrowLeftIcon width={16} height={16} />
          Kembali ke beranda
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Pusat bantuan</h1>
        <p className="mt-1 text-sm text-muted">Jawaban singkat untuk pertanyaan yang paling sering muncul.</p>

        <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
          {FAQ.map((item) => (
            <details
              key={item.id}
              id={item.id}
              open={item.id === "lupa-password"}
              className="group scroll-mt-6 p-4 open:bg-surface-muted/50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.q}
                <span className="text-muted transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="mt-3 text-sm leading-relaxed text-muted">{item.a}</div>
            </details>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted">
          Masih butuh bantuan? Kirim email ke{" "}
          <a href={`mailto:${ADMIN_EMAIL}`} className="text-primary hover:underline">
            {ADMIN_EMAIL}
          </a>
          .
        </p>
      </main>
    </>
  );
}
