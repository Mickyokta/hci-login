"use client";

import { type KeyboardEvent, useState } from "react";
import { CheckIcon } from "@/components/icons";

const FEATURES = [
  ["Daftar dalam satu menit", "Cukup nama, email, dan password, dengan syarat password yang terlihat jelas."],
  ["Password tersimpan aman", "Password dienkripsi sebelum disimpan, sehingga tidak bisa dibaca siapa pun."],
  ["Ingat saya", "Tetap masuk hingga 30 hari di perangkat pribadi Anda."],
  ["Pesan yang jelas", "Jika ada yang salah, Anda tahu penyebabnya dan cara memperbaikinya."],
] as const;

const HEURISTICS = [
  ["Visibility of system status", "Indikator loading dan notifikasi berhasil/gagal."],
  ["Match with the real world", "Bahasa Indonesia sehari-hari, tanpa kode error teknis."],
  ["User control and freedom", "Tombol kembali, pindah login ⇄ daftar, keluar kapan saja."],
  ["Consistency and standards", "Warna, posisi tombol, dan istilah sama di semua halaman."],
  ["Error prevention", "Validasi langsung, konfirmasi password, peringatan Caps Lock."],
  ["Recognition rather than recall", "Label jelas dan aturan password selalu terlihat."],
  ["Flexibility and efficiency", "Tekan Enter, Ingat saya, tampilkan password, autofill."],
  ["Aesthetic and minimalist design", "Hanya kolom yang benar-benar diperlukan."],
  ["Recover from errors", "Pesan error spesifik beserta cara memperbaikinya."],
  ["Help and documentation", "Tooltip, teks petunjuk, dan halaman Bantuan."],
] as const;

const TABS = [
  { id: "fitur", label: "Fitur", items: FEATURES, numbered: false },
  { id: "heuristics", label: "Heuristics", items: HEURISTICS, numbered: true },
] as const;

export function LandingTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  // Navigasi tab dengan panah kiri/kanan sesuai pola tab WAI-ARIA.
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next = (active + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setActive(next);
    document.getElementById(`tab-${TABS[next].id}`)?.focus();
  }

  return (
    <section className="mt-16">
      <div
        role="tablist"
        aria-label="Informasi aplikasi"
        className="inline-flex rounded-lg border border-border bg-surface p-1"
      >
        {TABS.map((t, i) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={handleKeyDown}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              i === active
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
            {t.numbered && <span className="ml-1.5 opacity-70">{t.items.length}</span>}
          </button>
        ))}
      </div>

      <ul
        id={`panel-${tab.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab.id}`}
        className="mt-5 grid gap-3 sm:grid-cols-2"
      >
        {tab.items.map(([title, text], i) => (
          <li key={title} className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary tabular-nums">
              {tab.numbered ? i + 1 : <CheckIcon width={14} height={14} />}
            </span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-0.5 text-sm text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
