import { Spinner } from "@/components/icons";

export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center gap-2 text-sm text-muted" role="status">
      <Spinner />
      Memuat data user…
    </main>
  );
}
