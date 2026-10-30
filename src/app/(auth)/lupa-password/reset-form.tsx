"use client";

import { type FormEvent, startTransition, useActionState, useState } from "react";
import { findAccountAction, type ResetState, resetPasswordAction } from "@/app/actions/auth";
import { CheckIcon } from "@/components/icons";
import { PasswordChecklist } from "@/components/password-checklist";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, focusField, Input, PasswordInput } from "@/components/ui/field";
import {
  type FieldErrors,
  forgotEmailSchema,
  getFieldErrors,
  type ResetPasswordValues,
  resetPasswordSchema,
} from "@/lib/validation";

type Fields = keyof ResetPasswordValues;
const ANSWER_FIELDS: Fields[] = ["securityAnswer", "password", "confirmPassword"];
const initialState: ResetState = { status: "idle", step: "email" };

export function ResetForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [values, setValues] = useState<ResetPasswordValues>({
    email: defaultEmail,
    securityAnswer: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors<ResetPasswordValues>>({});

  const [state, formAction, pending] = useActionState(
    async (prev: ResetState, formData: FormData | "back"): Promise<ResetState> => {
      if (formData === "back") return { status: "idle", step: "email" };

      const result =
        prev.step === "email"
          ? await findAccountAction(prev, formData)
          : await resetPasswordAction(prev, formData);

      const errors = result.fieldErrors ?? {};
      setServerErrors(errors);
      setTouched({});
      const first = (["email", ...ANSWER_FIELDS] as Fields[]).find((field) => errors[field]);
      if (first) focusField(first);
      return result;
    },
    initialState,
  );

  const step = state.step;
  const clientErrors: FieldErrors<ResetPasswordValues> =
    step === "email"
      ? getFieldErrors(forgotEmailSchema, values)
      : getFieldErrors(resetPasswordSchema, values);
  const errorFor = (field: Fields) =>
    serverErrors[field] ?? (touched[field] ? clientErrors[field] : undefined);

  function update(field: Fields, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setServerErrors((e) => ({ ...e, [field]: undefined }));
  }

  const touch = (field: Fields) => () => {
    if (values[field]) setTouched((t) => ({ ...t, [field]: true }));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields: Fields[] = step === "email" ? ["email"] : ANSWER_FIELDS;
    setTouched(Object.fromEntries(fields.map((field) => [field, true])));
    const firstInvalid = fields.find((field) => clientErrors[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  function goBack() {
    setValues((v) => ({ ...v, securityAnswer: "", password: "", confirmPassword: "" }));
    setServerErrors({});
    setTouched({});
    startTransition(() => formAction("back"));
  }

  const passwordsMatch =
    values.confirmPassword.length > 0 && values.password === values.confirmPassword;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-xs font-medium text-muted" aria-live="polite">
        Langkah {step === "email" ? 1 : 2} dari 2 ·{" "}
        {step === "email" ? "Cari akun Anda" : "Jawab pertanyaan keamanan"}
      </p>

      {state.status === "error" && state.message && !pending && (
        <Alert variant="error" title="Belum berhasil">
          {state.message}
        </Alert>
      )}

      {step === "email" ? (
        <Field
          id="email"
          label="Email"
          required
          error={errorFor("email")}
          hint="Masukkan email yang Anda pakai saat mendaftar."
        >
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nama@email.com"
            autoFocus
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={touch("email")}
            invalid={!!errorFor("email")}
            hasHint
            required
          />
        </Field>
      ) : (
        <>
          <input type="hidden" name="email" value={state.email ?? ""} />

          <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-muted px-3.5 py-2.5 text-sm">
            <span className="truncate">
              Akun: <strong className="font-medium">{state.email}</strong>
            </span>
            <button
              type="button"
              onClick={goBack}
              className="shrink-0 rounded font-medium text-primary hover:underline"
            >
              Ganti email
            </button>
          </div>

          <Field
            id="securityAnswer"
            label={state.question ?? "Jawaban"}
            required
            error={errorFor("securityAnswer")}
            hint="Ketik jawaban yang Anda isi saat mendaftar. Huruf besar/kecil tidak berpengaruh."
          >
            <Input
              id="securityAnswer"
              name="securityAnswer"
              autoComplete="off"
              placeholder="Ketik jawaban Anda"
              autoFocus
              value={values.securityAnswer}
              onChange={(e) => update("securityAnswer", e.target.value)}
              onBlur={touch("securityAnswer")}
              invalid={!!errorFor("securityAnswer")}
              hasHint
              maxLength={100}
              required
            />
          </Field>

          <Field id="password" label="Password baru" required error={errorFor("password")}>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="Buat password baru"
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              onBlur={touch("password")}
              invalid={!!errorFor("password")}
              aria-describedby="password-rules"
              maxLength={72}
              required
            />
            <PasswordChecklist id="password-rules" password={values.password} />
          </Field>

          <Field
            id="confirmPassword"
            label="Konfirmasi password baru"
            required
            error={errorFor("confirmPassword")}
            hint={
              passwordsMatch ? (
                <span className="flex items-center gap-1.5 text-success">
                  <CheckIcon width={14} height={14} /> Password cocok
                </span>
              ) : (
                "Ketik ulang password baru di atas."
              )
            }
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Ulangi password baru"
              value={values.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              onBlur={touch("confirmPassword")}
              invalid={!!errorFor("confirmPassword")}
              hasHint
              maxLength={72}
              required
            />
          </Field>
        </>
      )}

      <Button type="submit" loading={pending} loadingText="Memproses…" className="w-full">
        {step === "email" ? "Lanjut" : "Simpan password baru"}
      </Button>
    </form>
  );
}
