import Link from "next/link";
import { LockIcon } from "@/components/icons";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-md font-semibold">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <LockIcon width={16} height={16} />
      </span>
      HCI Login
    </Link>
  );
}
