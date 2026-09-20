import { NextResponse } from "next/server";
import { db } from "@/db";
import { formSubmissions, formTemplates, patients, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const patientId = url.searchParams.get("patientId");

    if (id) {
      const [s] = await db
        .select({
          submission: formSubmissions,
          template: formTemplates,
          patient: patients,
          doctor: { id: users.id, name: users.name, specialty: users.specialty },
        })
        .from(formSubmissions)
        .where(eq(formSubmissions.id, Number(id)))
        .innerJoin(formTemplates, eq(formSubmissions.templateId, formTemplates.id))
        .innerJoin(patients, eq(formSubmissions.patientId, patients.id))
        .innerJoin(users, eq(formSubmissions.doctorId, users.id))
        .limit(1);
      if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(s);
    }

    if (patientId) {
      const list = await db
        .select({
          submission: formSubmissions,
          template: formTemplates,
          doctor: { id: users.id, name: users.name },
        })
        .from(formSubmissions)
        .where(eq(formSubmissions.patientId, Number(patientId)))
        .innerJoin(formTemplates, eq(formSubmissions.templateId, formTemplates.id))
        .innerJoin(users, eq(formSubmissions.doctorId, users.id))
        .orderBy(desc(formSubmissions.createdAt));
      return NextResponse.json({ submissions: list });
    }

    // Admin: list all
    const q = url.searchParams.get("q");
    let baseQ = db
      .select({
        submission: formSubmissions,
        template: formTemplates,
        patient: patients,
        doctor: { id: users.id, name: users.name },
      })
      .from(formSubmissions)
      .innerJoin(formTemplates, eq(formSubmissions.templateId, formTemplates.id))
      .innerJoin(patients, eq(formSubmissions.patientId, patients.id))
      .innerJoin(users, eq(formSubmissions.doctorId, users.id))
      .orderBy(desc(formSubmissions.createdAt));

    const list = await (baseQ as any);
    return NextResponse.json({ submissions: list });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.templateId || !data.patientId) {
      return NextResponse.json({ error: "templateId and patientId required" }, { status: 400 });
    }
    // Pick first user as default doctor reference if no user specified
    const docId = data.doctorId || 1;
    const [inserted] = await db
      .insert(formSubmissions)
      .values({
        templateId: Number(data.templateId),
        patientId: Number(data.patientId),
        doctorId: docId,
        data: data.data || {},
        status: data.status || "completed",
        score: data.score ?? null,
        scoreLabel: data.scoreLabel ?? null,
        pdfData: data.pdfData ?? null,
      })
      .returning();
    return NextResponse.json({ submission: inserted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { id, ...rest } = data;
    const [updated] = await db
      .update(formSubmissions)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(formSubmissions.id, id))
      .returning();
    return NextResponse.json({ submission: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
