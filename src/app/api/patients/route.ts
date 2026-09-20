import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients, formSubmissions } from "@/db/schema";
import { eq, desc, ilike, or, sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const patientId = url.searchParams.get("patientId");
    const q = url.searchParams.get("q");

    if (id) {
      const [p] = await db.select().from(patients).where(eq(patients.id, Number(id))).limit(1);
      if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const submissions = await db
        .select()
        .from(formSubmissions)
        .where(eq(formSubmissions.patientId, p.id))
        .orderBy(desc(formSubmissions.createdAt));
      return NextResponse.json({ patient: p, submissions });
    }

    if (patientId) {
      const [p] = await db.select().from(patients).where(eq(patients.patientId, patientId)).limit(1);
      if (!p) return NextResponse.json({ patient: null });
      return NextResponse.json({ patient: p });
    }

    let query = db.select().from(patients).orderBy(desc(patients.createdAt));
    if (q) {
      query = db
        .select()
        .from(patients)
        .where(
          or(
            ilike(patients.name, `%${q}%`),
            ilike(patients.patientId, `%${q}%`),
            ilike(patients.consultant, `%${q}%`),
            ilike(patients.diagnosis, `%${q}%`)
          )
        )
        .orderBy(desc(patients.createdAt)) as any;
    }
    const list = await (query as any);
    return NextResponse.json({ patients: list });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name || !String(data.name).trim()) {
      return NextResponse.json({ error: "اسم المريض مطلوب" }, { status: 400 });
    }
    // Auto-generate patient_id if not provided
    if (!data.patientId) {
      const count = await db.select({ c: sql<number>`count(*)` }).from(patients);
      const n = Number(count[0]?.c ?? 0) + 1;
      data.patientId = `ALT-${String(n).padStart(6, "0")}`;
    }
    const [inserted] = await db
      .insert(patients)
      .values({
        name: String(data.name).trim(),
        patientId: String(data.patientId).trim(),
        department: data.department || null,
        roomBed: data.roomBed || null,
        nationalId: data.nationalId || null,
        consultant: data.consultant || null,
        diagnosis: data.diagnosis || null,
        age: data.age ? Number(data.age) : null,
        gender: data.gender || null,
      })
      .returning();
    return NextResponse.json({ patient: inserted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const [updated] = await db
      .update(patients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(patients.id, data.id))
      .returning();
    return NextResponse.json({ patient: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
