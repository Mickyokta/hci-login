"use client";

import Link from "next/link";
import { type FormEvent, startTransition, useActionState, useState } from "react";
import { type FormState, registerAction } from "@/app/actions/auth";
import { CheckIcon, CircleIcon } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, focusField, Input, PasswordInput } from "@/components/ui/field";
import { Tooltip } from "@/components/ui/tooltip";
import {
  type FieldErrors,
  getFieldErrors,
  PASSWORD_RULES,
  type RegisterValues,
  registerSchema,
} from "@/lib/validation";

type Fields = keyof RegisterValues;
const FIELD_ORDER: Fields[] = ["name", "email", "password", "confirmPassword"];
const initialState: FormState<RegisterValues> = { status: "idle" };

export function RegisterForm() {
  const [values, setValues] = useState<RegisterValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors<RegisterValues>>({});
  const [state, formAction, pending] = useActionState(
    async (prev: FormState<RegisterValues>, formData: FormData) => {
      const result = await registerAction(prev, formData);
      if (result.status === "error") {
        const errors = result.fieldErrors ?? {};
        setServerErrors(errors);
        const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
        if (firstInvalid) focusField(firstInvalid);
      }
      return result;
    },
    initialState,
  );

  const clientErrors = getFieldErrors(registerSchema, values);
  const errorFor = (field: Fields) =>
    serverErrors[field] ?? (touched[field] ? clientErrors[field] : undefined);

  function update(field: Fields, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setServerErrors((e) => ({ ...e, [field]: undefined }));
  }

  // Error saat blur hanya untuk kolom yang sudah diisi; pesan "wajib diisi"
  // baru muncul saat submit agar user tidak "dimarahi" sebelum sempat mengetik.
  const touch = (field: Fields) => () => {
    if (values[field]) setTouched((t) => ({ ...t, [field]: true }));
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    const firstInvalid = FIELD_ORDER.find((field) => clientErrors[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const emailTaken = serverErrors.email?.includes("sudah terdaftar");
  const passwordsMatch =
    values.confirmPassword.length > 0 && values.password === values.confirmPassword;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {state.status === "error" && state.message && !pending && (
        <Alert variant="error" title="Registrasi belum berhasil">
          {state.message}
        </Alert>
      )}

      <p className="text-xs text-muted">
        Kolom bertanda <span className="text-danger">*</span> wajib diisi.
      </p>

      <Field id="name" label="Nama lengkap" required error={errorFor("name")}>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Contoh: Budi Santoso"
          autoFocus
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          onBlur={touch("name")}
          invalid={!!errorFor("name")}
          maxLength={50}
          required
        />
      </Field>

      <Field
        id="email"
        label="Email"
        required
        error={errorFor("email")}
        hint="Email dipakai untuk masuk ke akun Anda."
      >
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nama@email.com"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={touch("email")}
          invalid={!!errorFor("email")}
          hasHint
          required
        />
      </Field>
      {emailTaken && (
        <p className="-mt-3 text-sm">
          <Link
            href={`/login?email=${encodeURIComponent(values.email.trim())}`}
            className="font-medium text-primary hover:underline"
          >
            Masuk dengan email ini →
          </Link>
        </p>
      )}

      <Field
        id="password"
        label="Password"
        required
        error={errorFor("password")}
        labelExtra={
          <Tooltip
            id="password-tip"
            label="Aturan password"
            text="Gunakan minimal 8 karakter dengan kombinasi huruf dan angka. Hindari tanggal lahir atau nama Anda."
          />
        }
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="Buat password"
          value={values.password}
          onChange={(e) => update("password", e.target.value)}
          onBlur={touch("password")}
          invalid={!!errorFor("password")}
          aria-describedby="password-rules"
          maxLength={72}
          required
        />
        <ul id="password-rules" className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs" aria-label="Syarat password">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(values.password);
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-1.5 ${ok ? "text-success" : "text-muted"}`}
              >
                {ok ? <CheckIcon width={14} height={14} /> : <CircleIcon width={14} height={14} />}
                {rule.label}
                <span className="sr-only">{ok ? "(terpenuhi)" : "(belum terpenuhi)"}</span>
              </li>
            );
          })}
        </ul>
      </Field>

      <Field
        id="confirmPassword"
        label="Konfirmasi password"
        required
        error={errorFor("confirmPassword")}
        hint={
          passwordsMatch ? (
            <span className="flex items-center gap-1.5 text-success">
              <CheckIcon width={14} height={14} /> Password cocok
            </span>
          ) : (
            "Ketik ulang password di atas untuk memastikan tidak ada salah ketik."
          )
        }
      >
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Ulangi password"
          value={values.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          onBlur={touch("confirmPassword")}
          invalid={!!errorFor("confirmPassword")}
          hasHint
          maxLength={72}
          required
        />
      </Field>

      <Button type="submit" loading={pending} loadingText="Mendaftarkan akun…" className="w-full">
        Daftar
      </Button>
    </form>
  );
}
