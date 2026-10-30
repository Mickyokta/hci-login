"use client";

import Link from "next/link";
import { type FormEvent, startTransition, useActionState, useState } from "react";
import { type FormState, loginAction } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, focusField, Input, PasswordInput } from "@/components/ui/field";
import { Tooltip } from "@/components/ui/tooltip";
import { type FieldErrors, getFieldErrors, type LoginValues, loginSchema } from "@/lib/validation";

type Fields = keyof LoginValues;
const FIELD_ORDER: Fields[] = ["email", "password"];
const initialState: FormState<LoginValues> = { status: "idle" };

export function LoginForm({ defaultEmail = "", next }: { defaultEmail?: string; next?: string }) {
  const [values, setValues] = useState<LoginValues>({ email: defaultEmail, password: "" });
  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors<LoginValues>>({});
  const [state, formAction, pending] = useActionState(
    async (prev: FormState<LoginValues>, formData: FormData) => {
      const result = await loginAction(prev, formData);
      if (result.status === "error") {
        setServerErrors(result.fieldErrors ?? {});
        // Konvensi umum: password dikosongkan setelah login gagal, email tetap.
        if (result.message) {
          setValues((v) => ({ ...v, password: "" }));
          setTouched((t) => ({ ...t, password: false }));
          focusField("password");
        }
      }
      return result;
    },
    initialState,
  );

  const clientErrors = getFieldErrors(loginSchema, values);
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
    setTouched({ email: true, password: true });
    const firstInvalid = FIELD_ORDER.find((field) => clientErrors[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {state.status === "error" && state.message && !pending && (
        <Alert variant="error" title="Gagal masuk">
          {state.message}
        </Alert>
      )}

      <input type="hidden" name="next" value={next ?? ""} />

      <Field id="email" label="Email" required error={errorFor("email")}>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nama@email.com"
          autoFocus={!defaultEmail}
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={touch("email")}
          invalid={!!errorFor("email")}
          required
        />
      </Field>

      <Field
        id="password"
        label="Password"
        required
        error={errorFor("password")}
        aside={
          <Link href="/bantuan#lupa-password" className="rounded text-sm font-medium text-primary hover:underline">
            Lupa password?
          </Link>
        }
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Masukkan password Anda"
          autoFocus={!!defaultEmail}
          value={values.password}
          onChange={(e) => update("password", e.target.value)}
          onBlur={touch("password")}
          invalid={!!errorFor("password")}
          required
        />
      </Field>

      <div className="flex items-center gap-2">
        <input
          id="remember"
          name="remember"
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <label htmlFor="remember" className="text-sm">
          Ingat saya
        </label>
        <Tooltip
          id="remember-tip"
          label="Apa itu Ingat saya?"
          text="Jika dicentang, Anda tetap masuk selama 30 hari di perangkat ini. Jangan centang di komputer umum."
        />
      </div>

      <Button type="submit" loading={pending} loadingText="Memproses…" className="w-full">
        Masuk
      </Button>
    </form>
  );
}
