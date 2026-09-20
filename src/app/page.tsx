import { db } from "@/db";
import { formTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import {
  ClipboardList,
  Users,
  HeartPulse,
  ClipboardCheck,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { FORM_WORKFLOW } from "@/lib/formWorkflow";

const STEP_ICONS = [
  ClipboardList,
  Users,
  HeartPulse,
  ClipboardCheck,
  BookOpen,
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const { seedDatabase } = await import("@/lib/seed");
    await seedDatabase();
  } catch (error) {
    console.error("Seed failed:", error);
  }

  const templates = await db
    .select()
    .from(formTemplates)
    .where(eq(formTemplates.isActive, true))
    .orderBy(formTemplates.orderIndex);

  const firstTemplate = templates[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#084e87] to-[#0d7a65] text-white shadow-xl">
        <div className="flex min-h-[330px] items-center" dir="rtl">
          <div className="flex w-full flex-col justify-center p-6 text-right sm:p-10 md:p-12">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              <CheckCircle2 size={15} />
              مسار إلكتروني واحد من خمس خطوات
            </div>
            <h1 className="mb-3 text-3xl font-black leading-tight md:text-5xl">
              نماذج مستشفى التداوي
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-white/90 md:text-xl">
              ابدأ بالنموذج الأول، وبعد الانتهاء اضغط «التالي» للانتقال تلقائيًا إلى النموذج التالي مع حفظ بيانات المريض وإجابات كل خطوة.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-lg">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-emerald-700">ترتيب النماذج</div>
            <h2 className="mt-1 text-2xl font-black text-slate-900">النماذج الخمسة</h2>
          </div>
          <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
            5 نماذج فقط
          </div>
        </div>

        <div className="relative space-y-3">
          {FORM_WORKFLOW.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <div
                key={step.key}
                className="relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a6ebd] to-[#14a085] text-white shadow-sm">
                  <Icon size={23} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-[#0a6ebd]">النموذج {index + 1}</div>
                  <div className="mt-0.5 font-black text-slate-900">{step.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{step.description}</div>
                </div>
                <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-sm font-black text-slate-600">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-7 border-t border-slate-200 pt-6">
          {firstTemplate ? (
            <Link
              href={`/forms/${firstTemplate.id}?workflow=1&start=1`}
              className="btn-primary w-full justify-center py-3.5 text-base sm:text-lg"
            >
              ابدأ النموذج الأول
              <ArrowLeft size={21} />
            </Link>
          ) : (
            <div className="rounded-xl bg-amber-50 p-4 text-center font-bold text-amber-800">
              جاري تجهيز النماذج...
            </div>
          )}
          <p className="mt-3 text-center text-xs text-slate-500">
            يتم الحفظ عند الضغط على «التالي»، ويمكنك الرجوع للنموذج السابق في أي وقت.
          </p>
        </div>
      </section>
    </div>
  );
}
