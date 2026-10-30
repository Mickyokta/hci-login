# HCI Login

Aplikasi registrasi dan login yang terhubung ke database PostgreSQL. Desain formnya menerapkan 10 Usability Heuristics dari Jakob Nielsen.

Penjelasan tiap heuristic dan letaknya di kode ada di [HEURISTICS.md](HEURISTICS.md).

## Fitur

- **Registrasi** (`/register`): nama, email, password, konfirmasi password, serta pertanyaan keamanan dan jawabannya. Data divalidasi di browser dan di server, lalu disimpan ke tabel `users`. Password disimpan sebagai hash bcrypt.
- **Login** (`/login`): ditolak jika email atau password salah. Ada opsi "Ingat saya" (30 hari), tombol tampilkan/sembunyikan password, dan peringatan Caps Lock.
- **Dashboard** (`/dashboard`, hanya untuk user yang sudah login): daftar semua user dari database, dengan pencarian.
- **Logout**: tombol "Keluar" menghapus cookie sesi.
- **Lupa password** (`/lupa-password`): user memasukkan email, menjawab pertanyaan keamanan yang dipilih saat registrasi, lalu membuat password baru. Jawaban disimpan sebagai hash bcrypt dan tidak membedakan huruf besar/kecil.
- **Bantuan** (`/bantuan`): FAQ.
- **Landing page** (`/`).

## Tech stack

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) + TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL, di-host di [Neon](https://neon.tech) (free tier) |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Auth | Implementasi sendiri: `bcryptjs` untuk hash, `jose` untuk JWT di cookie httpOnly |
| Validasi | Zod (skema yang sama dipakai di client dan server) |
| Hosting | Vercel |

## Struktur folder

```
prisma/schema.prisma          Model User (tabel "users")
prisma/migrations/            Migrasi SQL
src/proxy.ts                  Proteksi /dashboard, redirect user yang sudah login dari /login & /register
src/app/actions/auth.ts       Server Actions: registerAction, loginAction, logoutAction
src/app/(auth)/login/         Halaman dan form login
src/app/(auth)/register/      Halaman dan form registrasi
src/app/(auth)/lupa-password/ Halaman dan form lupa password (2 langkah)
src/app/dashboard/            Daftar user
src/app/bantuan/              Halaman bantuan / FAQ
src/lib/validation.ts         Skema Zod dan aturan password
src/lib/session.ts            Membuat, membaca, dan menghapus cookie sesi
src/lib/dal.ts                Akses data user (Data Access Layer)
src/components/               Komponen UI bersama (Button, Field, PasswordInput, Alert, Tooltip, ...)
```

## Menjalankan di komputer sendiri

Butuh Node.js 20.9 atau lebih baru.

1. Install dependency:
   ```bash
   npm install
   ```
2. Salin `.env.example` menjadi `.env`, lalu isi:
   - `DATABASE_URL` dan `DIRECT_URL`: connection string dari Neon (lihat bagian Deploy, langkah 1). Untuk Postgres lokal, isi keduanya dengan URL yang sama, misalnya `postgresql://postgres:postgres@localhost:5432/hci_login` (bisa dijalankan dengan `docker compose up -d`).
   - `SESSION_SECRET`: string acak minimal 32 karakter. Buat dengan `openssl rand -base64 32` atau `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
3. Buat tabel di database:
   ```bash
   npm run db:migrate
   ```
4. Jalankan:
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000.

## Deploy (Neon + Vercel)

### 1. Buat database di Neon

1. Daftar di https://neon.tech, lalu klik **New Project**. Pilih region terdekat (misalnya *AWS Asia Pacific (Singapore)*).
2. Di dashboard project, klik **Connect**. Salin dua connection string:
   - **Pooled connection** (host mengandung `-pooler`): isi ke `DATABASE_URL`.
   - **Direct connection** (matikan toggle *Connection pooling*): isi ke `DIRECT_URL`.
3. Isi keduanya di `.env` lokal, lalu jalankan `npm run db:deploy` untuk membuat tabel `users` di Neon. (Langkah ini juga dijalankan otomatis setiap kali Vercel build.)

### 2. Push ke GitHub

```bash
git add .
git commit -m "Aplikasi login dengan heuristic Nielsen"
git push origin main
```

### 3. Deploy di Vercel

1. Masuk ke https://vercel.com dengan akun GitHub, lalu **Add New → Project** dan import repo `hci-login`.
2. Framework preset otomatis terdeteksi sebagai **Next.js**. Build command tidak perlu diubah, karena Vercel otomatis memakai script `vercel-build` (`prisma generate && prisma migrate deploy && next build`).
3. Di **Environment Variables**, tambahkan:
   | Name | Value |
   |---|---|
   | `DATABASE_URL` | connection string *pooled* dari Neon |
   | `DIRECT_URL` | connection string *direct* dari Neon |
   | `SESSION_SECRET` | string acak minimal 32 karakter (jangan sama dengan yang lokal) |
4. Klik **Deploy**. Setelah selesai, aplikasi bisa diakses di `https://<nama-project>.vercel.app`.

> Alternatif: di Vercel buka **Storage → Create Database → Neon**. Vercel akan membuat database Neon dan mengisi `DATABASE_URL` secara otomatis. `DIRECT_URL` (versi tanpa `-pooler`) dan `SESSION_SECRET` tetap perlu ditambahkan sendiri.

## Melihat data langsung di database

Ada tiga cara untuk membuktikan data user benar-benar tersimpan:

- **Neon Console**: buka project, pilih **Tables** untuk melihat tabel `users`, atau buka **SQL Editor** dan jalankan:
  ```sql
  SELECT id, name, email, password_hash, security_question, security_answer_hash, created_at FROM users ORDER BY created_at DESC;
  ```
- **DBeaver / pgAdmin**: buat koneksi baru dengan tipe **PostgreSQL**:
  - Host: bagian host dari `DIRECT_URL` (contoh `ep-xxxx.ap-southeast-1.aws.neon.tech`)
  - Port: `5432`
  - Database: `neondb`
  - Username dan password: dari connection string
  - Tab SSL: centang *Use SSL*, mode `require`

  Lalu buka `neondb → Schemas → public → Tables → users`.
- **Prisma Studio**: jalankan `npm run db:studio`.

Kolom `password_hash` dan `security_answer_hash` berisi hash bcrypt (diawali `$2b$12$...`), bukan teks aslinya. Kolom `security_question` berisi id pertanyaan (misalnya `city`); teks pertanyaannya ada di `src/lib/validation.ts`.

## Script npm

| Script | Fungsi |
|---|---|
| `npm run dev` | Server development |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Membuat atau menerapkan migrasi (development) |
| `npm run db:deploy` | Menerapkan migrasi ke database produksi |
| `npm run db:studio` | Membuka Prisma Studio |
