import { z } from "zod";

// Aturan password ditampilkan sebagai checklist di form registrasi
// sekaligus dipakai untuk validasi di server, sehingga selalu sinkron.
export const PASSWORD_RULES = [
  {
    id: "length",
    label: "Minimal 8 karakter",
    message: "Password minimal 8 karakter.",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "letter",
    label: "Mengandung huruf",
    message: "Password harus mengandung minimal 1 huruf.",
    test: (value: string) => /[A-Za-z]/.test(value),
  },
  {
    id: "number",
    label: "Mengandung angka",
    message: "Password harus mengandung minimal 1 angka.",
    test: (value: string) => /\d/.test(value),
  },
] as const;

// Pertanyaan keamanan untuk fitur lupa password. Yang disimpan di database
// adalah id-nya, sehingga teks pertanyaan bisa diubah tanpa migrasi.
export const SECURITY_QUESTIONS = [
  { id: "pet", label: "Siapa nama hewan peliharaan pertama Anda?" },
  { id: "city", label: "Di kota mana Anda lahir?" },
  { id: "school", label: "Apa nama SD tempat Anda bersekolah?" },
  { id: "mother", label: "Siapa nama gadis ibu kandung Anda?" },
  { id: "food", label: "Apa makanan favorit Anda saat kecil?" },
] as const;

const QUESTION_IDS: string[] = SECURITY_QUESTIONS.map((q) => q.id);

export const questionLabel = (id: string | null | undefined) =>
  SECURITY_QUESTIONS.find((q) => q.id === id)?.label;

/** Jawaban disamakan dulu agar "Jakarta", " jakarta " dan "JAKARTA" dianggap sama. */
export const normalizeAnswer = (answer: string) =>
  answer.trim().toLowerCase().replace(/\s+/g, " ");

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email wajib diisi.")
  .pipe(z.email("Format email belum benar. Contoh: nama@email.com"));

const passwordField = z
  .string()
  .min(1, "Password wajib diisi.")
  .max(72, "Password maksimal 72 karakter.")
  .superRefine((value, ctx) => {
    const failed = PASSWORD_RULES.find((rule) => !rule.test(value));
    if (value && failed) ctx.addIssue({ code: "custom", message: failed.message });
  });

const answerField = z
  .string()
  .trim()
  .min(1, "Jawaban wajib diisi.")
  .max(100, "Jawaban maksimal 100 karakter.");

const passwordsMatch = {
  check: (data: { password: string; confirmPassword: string }) =>
    !data.confirmPassword || data.password === data.confirmPassword,
  params: {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama. Ketik ulang password yang sama.",
  },
};

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nama wajib diisi.")
      .min(2, "Nama minimal 2 karakter.")
      .max(50, "Nama maksimal 50 karakter."),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Ulangi password Anda."),
    // Bukan z.enum: kegagalan enum menghentikan .refine() di bawah (cek konfirmasi password).
    securityQuestion: z
      .string()
      .refine((id) => QUESTION_IDS.includes(id), "Pilih salah satu pertanyaan keamanan."),
    securityAnswer: answerField,
  })
  .refine(passwordsMatch.check, passwordsMatch.params);

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password wajib diisi."),
});

export const forgotEmailSchema = z.object({ email: emailField });

export const resetPasswordSchema = z
  .object({
    email: emailField,
    securityAnswer: answerField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Ulangi password baru Anda."),
  })
  .refine(passwordsMatch.check, passwordsMatch.params);

export type RegisterValues = z.input<typeof registerSchema>;
export type LoginValues = z.input<typeof loginSchema>;
export type ResetPasswordValues = z.input<typeof resetPasswordSchema>;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Mengambil pesan error pertama untuk setiap field. */
export function getFieldErrors<T extends z.ZodType>(
  schema: T,
  values: unknown,
): FieldErrors<z.input<T>> {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]);
    errors[key] ??= issue.message;
  }
  return errors as FieldErrors<z.input<T>>;
}

/** Hanya izinkan redirect ke path internal, mencegah open redirect. */
export function safeNextPath(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}
