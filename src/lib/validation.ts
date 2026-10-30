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

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email wajib diisi.")
  .pipe(z.email("Format email belum benar. Contoh: nama@email.com"));

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nama wajib diisi.")
      .min(2, "Nama minimal 2 karakter.")
      .max(50, "Nama maksimal 50 karakter."),
    email: emailField,
    password: z
      .string()
      .min(1, "Password wajib diisi.")
      .max(72, "Password maksimal 72 karakter.")
      .superRefine((value, ctx) => {
        const failed = PASSWORD_RULES.find((rule) => !rule.test(value));
        if (value && failed) ctx.addIssue({ code: "custom", message: failed.message });
      }),
    confirmPassword: z.string().min(1, "Ulangi password Anda."),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama. Ketik ulang password yang sama.",
  });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password wajib diisi."),
});

export type RegisterValues = z.input<typeof registerSchema>;
export type LoginValues = z.input<typeof loginSchema>;

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
