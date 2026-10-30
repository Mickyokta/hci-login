"use client";

import {
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  useState,
} from "react";
import { AlertIcon, EyeIcon, EyeOffIcon } from "@/components/icons";

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  /** Elemen tambahan di sebelah kanan label, mis. tooltip atau link. */
  aside?: ReactNode;
  labelExtra?: ReactNode;
  children: ReactNode;
};

export const hintId = (id: string) => `${id}-hint`;
export const errorId = (id: string) => `${id}-error`;

/** Memindahkan fokus ke field (dipakai untuk mengarahkan user ke error pertama). */
export const focusField = (id: string) => document.getElementById(id)?.focus();

export function Field({ id, label, required, hint, error, aside, labelExtra, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium">
          {label}
          {required && (
            <span className="text-danger" aria-hidden="true">
              *
            </span>
          )}
          {labelExtra}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={errorId(id)} className="flex items-start gap-1.5 text-sm text-danger">
          <AlertIcon width={15} height={15} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <div id={hintId(id)} className="text-xs text-muted">
            {hint}
          </div>
        )
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  invalid?: boolean;
  hasHint?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export const inputClass = (invalid?: boolean) =>
  `block w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/70 transition-shadow outline-none focus:ring-4 ${
    invalid
      ? "border-danger focus:border-danger focus:ring-danger/20"
      : "border-border focus:border-primary focus:ring-ring"
  }`;

export function Input({
  id,
  invalid,
  hasHint,
  className = "",
  "aria-describedby": extraDescribedBy,
  ...props
}: InputProps) {
  const describedBy = [invalid ? errorId(id) : hasHint ? hintId(id) : null, extraDescribedBy]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy || undefined}
      className={`${inputClass(invalid)} ${className}`}
      {...props}
    />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  invalid?: boolean;
  hasHint?: boolean;
};

export function Select({ id, invalid, hasHint, className = "", ...props }: SelectProps) {
  return (
    <select
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? errorId(id) : hasHint ? hintId(id) : undefined}
      className={`${inputClass(invalid)} ${className}`}
      {...props}
    />
  );
}

/** Input password dengan tombol tampilkan/sembunyikan dan peringatan Caps Lock. */
export function PasswordInput(props: Omit<InputProps, "type">) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const detectCapsLock = (event: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState("CapsLock"));

  return (
    <div>
      <div className="relative">
        <Input
          {...props}
          type={visible ? "text" : "password"}
          className="pr-11"
          onKeyDown={detectCapsLock}
          onKeyUp={detectCapsLock}
          onBlur={(event) => {
            setCapsLock(false);
            props.onBlur?.(event);
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          aria-pressed={visible}
          aria-controls={props.id}
          title={visible ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted hover:text-foreground"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {capsLock && (
        <p role="status" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-warning">
          <AlertIcon width={14} height={14} />
          Caps Lock sedang aktif.
        </p>
      )}
    </div>
  );
}
