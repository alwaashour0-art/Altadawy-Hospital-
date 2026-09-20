import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients, formSubmissions, formTemplates, users } from "@/db/schema";
import { ilike, or, desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    if (!q) return NextResponse.json({ patients: [], submissions: [] });

    const matchedPatients = await db
      .select()
      .from(patients)
      .where(
        or(
          ilike(patients.name, `%${q}%`),
          ilike(patients.patientId, `%${q}%`),
          ilike(patients.consultant, `%${q}%`),
          ilike(patients.diagnosis, `%${q}%`),
          ilike(patients.nationalId, `%${q}%`)
        )
      )
      .orderBy(desc(patients.createdAt))
      .limit(50);

    // submissions by doctor name or template name
    const submissions = await db
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
      .where(
        or(ilike(users.name, `%${q}%`), ilike(formTemplates.name, `%${q}%`))
      )
      .orderBy(desc(formSubmissions.createdAt))
      .limit(50);

    return NextResponse.json({ patients: matchedPatients, submissions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
