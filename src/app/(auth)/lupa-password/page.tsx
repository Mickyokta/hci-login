import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Lupa password" };

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/lupa-password">) {
  const { email } = await searchParams;

  return (
    <AuthCard
      title="Lupa password?"
      subtitle="Jawab pertanyaan keamanan yang Anda pilih saat mendaftar untuk membuat password baru."
      footer={
        <>
          Sudah ingat password Anda?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Kembali ke halaman masuk
          </Link>
        </>
      }
    >
      <ResetForm defaultEmail={typeof email === "string" ? email : ""} />
    </AuthCard>
  );
}
