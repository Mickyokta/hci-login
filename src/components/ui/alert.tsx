"use client";

import { type ReactNode, useState } from "react";
import { AlertIcon, CloseIcon, InfoIcon, SuccessIcon } from "@/components/icons";

type Variant = "success" | "error" | "info" | "warning";

const styles: Record<Variant, string> = {
  success: "border-success/30 bg-success-soft text-success",
  error: "border-danger/30 bg-danger-soft text-danger",
  info: "border-primary/30 bg-primary-soft text-primary",
  warning: "border-warning/30 bg-warning-soft text-warning",
};

const icons: Record<Variant, typeof InfoIcon> = {
  success: SuccessIcon,
  error: AlertIcon,
  info: InfoIcon,
  warning: AlertIcon,
};

type AlertProps = {
  variant: Variant;
  title?: string;
  children?: ReactNode;
  dismissible?: boolean;
};

export function Alert({ variant, title, children, dismissible = false }: AlertProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const Icon = icons[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm ${styles[variant]}`}
    >
      <Icon className="mt-0.5 shrink-0" />
      <div className="flex-1 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-foreground/85">{children}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup pesan"
          className="-m-1 rounded p-1 opacity-70 hover:opacity-100"
        >
          <CloseIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
}
