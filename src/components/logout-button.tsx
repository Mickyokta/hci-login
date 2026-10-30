"use client";

import { useFormStatus } from "react-dom";
import { logoutAction } from "@/app/actions/auth";
import { LogoutIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" loading={pending} loadingText="Keluar…">
      <LogoutIcon width={16} height={16} />
      Keluar
    </Button>
  );
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SubmitButton />
    </form>
  );
}
