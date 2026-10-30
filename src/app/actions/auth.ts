"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import {
  type FieldErrors,
  getFieldErrors,
  type LoginValues,
  forgotEmailSchema,
  loginSchema,
  normalizeAnswer,
  questionLabel,
  type RegisterValues,
  registerSchema,
  type ResetPasswordValues,
  resetPasswordSchema,
  safeNextPath,
} from "@/lib/validation";

export type FormState<T> = {
  status: "idle" | "error";
  /** Pesan untuk seluruh form, ditampilkan di atas form. */
  message?: string;
  fieldErrors?: FieldErrors<T>;
};

const SERVER_ERROR =
  "Server sedang tidak dapat dihubungi. Periksa koneksi internet Anda, lalu coba lagi dalam beberapa saat.";

// Hash pembanding agar waktu respons login sama, baik email terdaftar
// maupun tidak (mencegah menebak email lewat lamanya respons).
const DUMMY_HASH = "$2b$12$mjb0xWOldneoWBH4x8WQTedgb0wv1IX8RG3RHCz7D30A4dG4FDcOS";

function isUniqueViolation(error: unknown) {
  return (error as { code?: string } | null)?.code === "P2002";
}

export async function registerAction(
  _prev: FormState<RegisterValues>,
  formData: FormData,
): Promise<FormState<RegisterValues>> {
  const values = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    securityQuestion: formData.get("securityQuestion"),
    securityAnswer: formData.get("securityAnswer"),
  };

  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Beberapa data belum sesuai. Periksa kolom yang ditandai merah.",
      fieldErrors: getFieldErrors(registerSchema, values),
    };
  }

  const { name, email, password, securityQuestion, securityAnswer } = parsed.data;

  try {
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return {
        status: "error",
        fieldErrors: {
          email: "Email ini sudah terdaftar. Silakan masuk, atau gunakan email lain.",
        },
      };
    }

    await db.user.create({
      data: {
        name,
        email,
        passwordHash: await hash(password, 12),
        securityQuestion,
        securityAnswerHash: await hash(normalizeAnswer(securityAnswer), 12),
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        fieldErrors: {
          email: "Email ini sudah terdaftar. Silakan masuk, atau gunakan email lain.",
        },
      };
    }
    console.error("registerAction", error);
    return { status: "error", message: SERVER_ERROR };
  }

  redirect(`/login?registered=1&email=${encodeURIComponent(email)}`);
}

export async function loginAction(
  _prev: FormState<LoginValues>,
  formData: FormData,
): Promise<FormState<LoginValues>> {
  const values = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const remember = formData.get("remember") === "on";
  const next = safeNextPath(formData.get("next"));

  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: getFieldErrors(loginSchema, values) };
  }

  const { email, password } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
    const passwordOk = await compare(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !passwordOk) {
      return {
        status: "error",
        message:
          "Email atau password salah. Periksa kembali ejaan email dan pastikan Caps Lock tidak aktif.",
      };
    }

    await createSession(user.id, remember);
  } catch (error) {
    console.error("loginAction", error);
    return { status: "error", message: SERVER_ERROR };
  }

  redirect(next);
}

export type ResetState = FormState<ResetPasswordValues> & {
  step: "email" | "answer";
  email?: string;
  question?: string;
};

/** Lupa password, langkah 1: cari akun dari email lalu tampilkan pertanyaannya. */
export async function findAccountAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const values = { email: formData.get("email") };
  const parsed = forgotEmailSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", step: "email", fieldErrors: getFieldErrors(forgotEmailSchema, values) };
  }

  const { email } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { securityQuestion: true },
    });
    if (!user) {
      return {
        status: "error",
        step: "email",
        fieldErrors: {
          email: "Email ini belum terdaftar. Periksa ejaannya, atau daftar akun baru.",
        },
      };
    }

    const question = questionLabel(user.securityQuestion);
    if (!question) {
      return {
        status: "error",
        step: "email",
        message:
          "Akun ini dibuat sebelum fitur pertanyaan keamanan tersedia, jadi belum bisa dipulihkan otomatis. Silakan hubungi admin melalui halaman Bantuan.",
      };
    }

    return { status: "idle", step: "answer", email, question };
  } catch (error) {
    console.error("findAccountAction", error);
    return { status: "error", step: "email", message: SERVER_ERROR };
  }
}

/** Lupa password, langkah 2: cocokkan jawaban lalu simpan password baru. */
export async function resetPasswordAction(
  prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const values = {
    email: formData.get("email"),
    securityAnswer: formData.get("securityAnswer"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };
  const current = { step: "answer" as const, email: prev.email, question: prev.question };

  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ...current,
      status: "error",
      fieldErrors: getFieldErrors(resetPasswordSchema, values),
    };
  }

  const { email, securityAnswer, password } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, securityAnswerHash: true },
    });
    if (!user?.securityAnswerHash) {
      return { status: "error", step: "email", message: "Akun tidak ditemukan. Silakan ulangi dari awal." };
    }

    const answerOk = await compare(normalizeAnswer(securityAnswer), user.securityAnswerHash);
    if (!answerOk) {
      return {
        ...current,
        status: "error",
        fieldErrors: {
          securityAnswer:
            "Jawaban tidak cocok. Periksa ejaannya (huruf besar/kecil tidak berpengaruh).",
        },
      };
    }

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await hash(password, 12) },
    });
  } catch (error) {
    console.error("resetPasswordAction", error);
    return { ...current, status: "error", message: SERVER_ERROR };
  }

  redirect(`/login?reset=1&email=${encodeURIComponent(email)}`);
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login?logout=1");
}
