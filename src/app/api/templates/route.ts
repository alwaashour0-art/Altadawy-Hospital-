import { NextResponse } from "next/server";
import { db } from "@/db";
import { formTemplates } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // Templates can be read publicly so forms open directly without login blockers
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const all = url.searchParams.get("all") === "true";

    if (id) {
      const [t] = await db.select().from(formTemplates).where(eq(formTemplates.id, Number(id))).limit(1);
      if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ template: t });
    }

    let q = db.select().from(formTemplates);
    if (!all) {
      q = q.where(eq(formTemplates.isActive, true)) as any;
    }
    const list = await (q as any).orderBy(asc(formTemplates.orderIndex), asc(formTemplates.id));
    return NextResponse.json({ templates: list });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const [inserted] = await db
      .insert(formTemplates)
      .values({
        name: data.name,
        icon: data.icon || "FileText",
        description: data.description || null,
        schema: data.schema,
        scoringType: data.scoringType || null,
        isActive: data.isActive !== false,
        orderIndex: data.orderIndex ?? 999,
      })
      .returning();
    return NextResponse.json({ template: inserted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const [updated] = await db
      .update(formTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(formTemplates.id, data.id))
      .returning();
    return NextResponse.json({ template: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await db.delete(formTemplates).where(eq(formTemplates.id, id));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
