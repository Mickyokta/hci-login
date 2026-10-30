import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

// Satu instance PrismaClient per proses agar koneksi database tidak habis
// (terutama saat hot-reload di development).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // DATABASE_URL = koneksi pooled Neon (host "-pooler"), cocok untuk serverless.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // Di Vercel Fluid compute, koneksi idle ditutup sebelum fungsi dibekukan.
  // Di luar Vercel fungsi ini tidak berpengaruh.
  attachDatabasePool(pool);
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
