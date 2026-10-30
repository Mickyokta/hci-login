import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="flex items-center gap-2">{children}</nav>
      </div>
    </header>
  );
}
