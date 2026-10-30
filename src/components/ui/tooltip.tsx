import { HelpIcon } from "@/components/icons";

/** Tombol "?" kecil yang menampilkan penjelasan saat di-hover atau di-fokus. */
export function Tooltip({ id, label, text }: { id: string; label: string; text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        className="rounded-full text-muted hover:text-primary focus-visible:text-primary"
      >
        <HelpIcon width={15} height={15} />
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-2 w-60 -translate-x-1/2 rounded-md bg-foreground px-3 py-2 text-xs font-normal leading-relaxed text-background opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
