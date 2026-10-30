import "dotenv/config";
import { defineConfig } from "prisma/config";

// CLI Prisma (migrate, studio) memakai koneksi langsung (non-pooled) Neon,
// karena migrasi tidak berjalan baik lewat PgBouncer.
// Aplikasi saat runtime memakai DATABASE_URL (pooled) lewat src/lib/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
