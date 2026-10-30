import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { Alert } from "@/components/ui/alert";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const get = (key: string) => (typeof params[key] === "string" ? params[key] : undefined);

  const email = get("email");
  const next = get("next");

  return (
    <AuthCard
      title="Masuk ke akun Anda"
      subtitle="Gunakan email dan password yang Anda daftarkan."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Daftar sekarang
          </Link>
        </>
      }
    >
      <div className="mb-5 space-y-3 empty:hidden">
        {get("registered") && (
          <Alert variant="success" title="Registrasi berhasil!" dismissible>
            Akun Anda sudah tersimpan. Silakan masuk dengan password yang baru dibuat.
          </Alert>
        )}
        {get("reset") && (
          <Alert variant="success" title="Password berhasil diubah" dismissible>
            Silakan masuk dengan password baru Anda.
          </Alert>
        )}
        {get("logout") && (
          <Alert variant="info" title="Anda telah keluar" dismissible>
            Sampai jumpa lagi. Masuk kembali kapan saja.
          </Alert>
        )}
        {get("expired") && (
          <Alert variant="warning" title="Sesi berakhir" dismissible>
            Akun untuk sesi ini tidak ditemukan. Silakan masuk kembali.
          </Alert>
        )}
        {next && (
          <Alert variant="info">Silakan masuk terlebih dahulu untuk membuka halaman tersebut.</Alert>
        )}
      </div>

      <LoginForm defaultEmail={email} next={next} />
    </AuthCard>
  );
}
