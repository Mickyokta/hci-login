import { CheckIcon, CircleIcon } from "@/components/icons";
import { PASSWORD_RULES } from "@/lib/validation";

/** Syarat password yang langsung berubah hijau saat terpenuhi. */
export function PasswordChecklist({ id, password }: { id: string; password: string }) {
  return (
    <ul id={id} className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs" aria-label="Syarat password">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
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
  );
}
