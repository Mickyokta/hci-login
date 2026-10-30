# Penerapan 10 Usability Heuristics Nielsen

Dokumen ini menjelaskan bagaimana tiap heuristic diterapkan pada form registrasi, form login, dan halaman pendukungnya, beserta lokasi kodenya.

## 1. Visibility of system status

User selalu tahu apa yang sedang terjadi.

- Saat form dikirim, tombol berubah menjadi spinner dengan teks **"Memproses…"** (login) atau **"Mendaftarkan akun…"** (registrasi), dan tombol dinonaktifkan. Lihat `Button` dengan prop `loading` di `src/components/ui/button.tsx`, yang memakai `pending` dari `useActionState`.
- Setelah registrasi berhasil, muncul notifikasi hijau **"Registrasi berhasil!"** di halaman login. Setelah logout muncul **"Anda telah keluar"**. Lihat `src/app/(auth)/login/page.tsx`.
- Checklist aturan password berubah hijau secara real-time saat diketik, dan muncul tanda **"✓ Password cocok"** saat konfirmasi sudah sama (`register-form.tsx`).
- Peringatan **"Caps Lock sedang aktif."** muncul saat mengetik password (`PasswordInput` di `field.tsx`).
- Dashboard menampilkan **"Masuk sebagai {nama}"** dan badge **"Anda"** di baris milik user. Saat data dimuat, muncul **"Memuat data user…"** (`dashboard/loading.tsx`).

## 2. Match between system and the real world

Bahasa yang dipakai adalah bahasa user, bukan bahasa sistem.

- Seluruh antarmuka memakai Bahasa Indonesia sehari-hari: "Masuk", "Daftar", "Keluar", "Ingat saya", "Lupa password?".
- Error teknis tidak pernah ditampilkan mentah. Contohnya, error unique constraint Prisma `P2002` diterjemahkan menjadi *"Email ini sudah terdaftar…"*, dan database yang tidak bisa dihubungi menjadi *"Server sedang tidak dapat dihubungi. Periksa koneksi internet Anda…"* (`src/app/actions/auth.ts`). Halaman error umum juga memakai kalimat yang sama (`src/app/error.tsx`).
- Tanggal daftar ditampilkan dalam format lokal, misalnya *"30 Okt 2026, 20.02 WIB"* (`dashboard/page.tsx`).
- Ikon yang dipakai sudah umum dikenal: mata untuk melihat password, gembok untuk logo, panah untuk kembali.

## 3. User control and freedom

User selalu punya jalan keluar.

- Halaman login dan registrasi punya link **"← Kembali ke beranda"** dan **"Butuh bantuan?"** (`src/components/auth-card.tsx`).
- Link untuk pindah halaman ada di bawah kartu: "Belum punya akun? **Daftar sekarang**" dan "Sudah punya akun? **Masuk di sini**".
- Jika email sudah terdaftar, muncul link **"Masuk dengan email ini →"** yang langsung membuka halaman login dengan email terisi.
- Tombol **"Keluar"** selalu ada di header dashboard.
- Notifikasi bisa ditutup dengan tombol ×. Pencarian di dashboard punya tombol **"Hapus pencarian"**.
- Saat validasi gagal, isian user tidak dihapus sehingga tidak perlu mengetik ulang. Pengecualiannya adalah password setelah login gagal; lihat heuristic 4.

## 4. Consistency and standards

- Semua halaman memakai komponen yang sama (`Button`, `Field`, `Input`, `PasswordInput`, `Alert`, `AuthCard`) dan warna dari design token di `src/app/globals.css`. Warna ungu selalu berarti aksi utama, merah berarti error, hijau berarti berhasil.
- Tombol aksi utama selalu ada di bawah form dengan lebar penuh. Link sekunder selalu berada di bawah kartu.
- Mengikuti konvensi umum form login di web:
  - Link "Lupa password?" ada di kanan label password.
  - Checkbox "Ingat saya" ada di atas tombol Masuk.
  - Password dikosongkan setelah login gagal, sedangkan email tetap terisi.
  - Atribut `autocomplete` (`email`, `current-password`, `new-password`) dipasang agar password manager bekerja normal.
- Istilahnya tetap sama di semua halaman: selalu "Masuk" (bukan campuran Login/Sign in), "Daftar", dan "Keluar".

## 5. Error prevention

Kesalahan dicegah sebelum terjadi.

- Field wajib ditandai dengan **\*** merah, dan ada keterangan *"Kolom bertanda \* wajib diisi."*
- Format email dan aturan password divalidasi langsung di browser saat user meninggalkan kolom, sebelum dikirim ke server. Skema validasinya sama dengan yang dipakai server (`src/lib/validation.ts`).
- Ada kolom **konfirmasi password** untuk mencegah salah ketik.
- **Peringatan Caps Lock** mencegah password salah karena huruf besar.
- Tombol dinonaktifkan selama proses berjalan agar form tidak terkirim dua kali.
- `maxLength` pada input mencegah input melebihi batas, misalnya nama 50 karakter dan password 72 karakter (batas bcrypt).
- Email otomatis di-*trim* dan diubah ke huruf kecil, sehingga `Budi@Mail.com ` dan `budi@mail.com` dianggap sama dan tidak terjadi akun ganda.
- Pesan "wajib diisi" baru muncul saat submit, bukan saat user hanya berpindah kolom. Ini mencegah tata letak bergeser tepat ketika user mengklik tombol.

## 6. Recognition rather than recall

User tidak perlu mengingat informasi.

- **Label selalu terlihat** di atas input. Placeholder hanya berisi contoh (`nama@email.com`, `Contoh: Budi Santoso`), bukan pengganti label.
- **Aturan password ditampilkan langsung** sebagai checklist di bawah kolom password, jadi user tidak perlu menebak syaratnya.
- Setelah registrasi, **email otomatis terisi** di halaman login dan kursor langsung berada di kolom password.
- Teks petunjuk di bawah kolom, misalnya *"Email dipakai untuk masuk ke akun Anda."*
- Saat user diarahkan ke login dari halaman terproteksi, muncul penjelasan *"Silakan masuk terlebih dahulu untuk membuka halaman tersebut."* Setelah login, user dikembalikan ke halaman yang tadi ingin dibuka.

## 7. Flexibility and efficiency of use

- Form bisa dikirim dengan **tombol Enter**, karena memakai elemen `<form>` dan tombol `type="submit"` standar.
- **"Ingat saya"** membuat sesi bertahan 30 hari. Jika tidak dicentang, user otomatis keluar saat browser ditutup (`src/lib/session.ts`).
- **Tampilkan/sembunyikan password** dengan ikon mata.
- **Autofocus** pada kolom pertama, dan atribut `autocomplete` yang mendukung autofill browser serta password manager.
- `inputMode="email"` menampilkan keyboard email (dengan @) di HP.
- Pencarian instan di tabel user dashboard.
- Redirect `?next=`: setelah login, user langsung dibawa ke halaman tujuan awal.

*Catatan relevansi:* form login hanya berisi dua kolom, sehingga fitur akselerator untuk pengguna ahli (misalnya shortcut keyboard khusus) tidak diperlukan. Fleksibilitas pada form ini terutama datang dari dukungan Enter, autofill/password manager, dan "Ingat saya".

## 8. Aesthetic and minimalist design

- Form berada di satu kartu di tengah layar, tanpa elemen dekoratif yang tidak perlu.
- Hanya kolom esensial yang diminta: 2 kolom untuk login dan 4 kolom untuk registrasi.
- Pesan error menggantikan teks petunjuk di posisi yang sama, sehingga tidak menumpuk.
- Dashboard hanya menampilkan informasi yang relevan (nama, email, tanggal daftar, dan jumlah user). Hash password tidak ditampilkan.
- Tata letak responsif untuk HP tanpa scroll horizontal, dan otomatis mengikuti dark mode sistem.

## 9. Help users recognize, diagnose, and recover from errors

Pesan error ditampilkan di samping kolom yang bermasalah, menjelaskan masalahnya, dan memberi solusi.

| Situasi | Pesan |
|---|---|
| Nama kosong | Nama wajib diisi. |
| Email salah format | Format email belum benar. Contoh: nama@email.com |
| Password terlalu pendek | Password minimal 8 karakter. |
| Password tanpa angka | Password harus mengandung minimal 1 angka. |
| Konfirmasi berbeda | Konfirmasi password tidak sama. Ketik ulang password yang sama. |
| Email sudah terdaftar | Email ini sudah terdaftar. Silakan masuk, atau gunakan email lain. (dengan link "Masuk dengan email ini →") |
| Login gagal | Email atau password salah. Periksa kembali ejaan email dan pastikan Caps Lock tidak aktif. |
| Database tidak dapat dihubungi | Server sedang tidak dapat dihubungi. Periksa koneksi internet Anda, lalu coba lagi dalam beberapa saat. |
| Halaman tidak ada | Halaman tidak ditemukan. (dengan tombol "Ke beranda" dan "Bantuan") |

Selain teksnya:

- Kolom yang error diberi **border merah dan ikon**, dan fokus otomatis dipindahkan ke kolom error pertama.
- Atribut `aria-invalid` dan `aria-describedby` dipasang supaya pembaca layar membacakan pesan error.

*Catatan:* pesan login gagal sengaja **tidak** menyebutkan apakah yang salah emailnya atau passwordnya. Jika pesannya membedakan keduanya, orang lain bisa mengecek email siapa saja yang terdaftar (*user enumeration*). Ini kompromi antara heuristic 9 dan keamanan, dan merupakan praktik standar. Sebagai gantinya, pesan tetap memberi langkah perbaikan (cek ejaan email dan Caps Lock), dan alasannya dijelaskan di halaman Bantuan.

## 10. Help and documentation

- **Tooltip "?"** di samping label Password (aturan password) dan "Ingat saya" (penjelasan fungsinya, termasuk saran tidak mencentangnya di komputer umum) (`src/components/ui/tooltip.tsx`).
- **Teks petunjuk** di bawah kolom email dan konfirmasi password.
- Link **"Lupa password?"** membuka halaman pemulihan akun (`/lupa-password`) yang memandu user dalam 2 langkah, dengan keterangan "Langkah 1 dari 2" dan "Langkah 2 dari 2". Email yang sudah diketik di form login ikut terbawa.
- Link **"Butuh bantuan?"** menuju halaman **Pusat bantuan** (`/bantuan`). Halaman itu berisi FAQ tentang cara memulihkan akun, syarat password, arti pesan login gagal, fungsi "Ingat saya", dan lokasi penyimpanan data.

*Catatan relevansi:* aplikasi ini sederhana dan sebagian besar sudah bisa dipahami tanpa dokumentasi. Karena itu bantuan dibuat singkat dan kontekstual (tooltip dan petunjuk di samping kolom), bukan manual panjang. Reset password lewat email tidak dibuat karena membutuhkan layanan pengiriman email. Sebagai gantinya dipakai pertanyaan keamanan yang dipilih saat registrasi.
