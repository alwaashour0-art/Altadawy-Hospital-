export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { seedDatabase } from "@/lib/seed";
import { sql } from "drizzle-orm";

// Run seed on first health check so data is populated
let seeded = false;
let seedingPromise: Promise<void> | null = null;

export async function GET() {
  try {
    if (!seeded) {
      if (!seedingPromise) {
        seedingPromise = seedDatabase()
          .then(() => {
            seeded = true;
          })
          .catch((e) => {
            seedingPromise = null;
            throw e;
          });
      }
      await seedingPromise;
    }
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
