"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Printer, ArrowRight, Loader2, Files, Info } from "lucide-react";
import { HistoryExamForm } from "@/components/HistoryExamForm";
import { MultidisciplinaryCareForm } from "@/components/MultidisciplinaryCareForm";
import { PaduaForm } from "@/components/PaduaForm";
import { DoctorOrdersForm } from "@/components/DoctorOrdersForm";
import { HealthEducationForm } from "@/components/HealthEducationForm";
import {
  isDoctorOrders,
  isHealthEducation,
  isHistoryExam,
  isMultidisciplinaryCare,
  isPadua,
} from "@/lib/formSchemas";

function ExamPrintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const autoPrint = searchParams.get("autoprint") === "1";
  const printedRef = useRef(false);

  const [patient, setPatient] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }
      try {
        const [patientResponse, templatesResponse, submissionsResponse] =
          await Promise.all([
            fetch(`/api/patients?id=${patientId}`),
            fetch("/api/templates"),
            fetch(`/api/submissions?patientId=${patientId}`),
          ]);

        if (patientResponse.ok) {
          const result = await patientResponse.json();
          setPatient(result.patient || null);
        }
        if (templatesResponse.ok) {
          const result = await templatesResponse.json();
          setTemplates(result.templates || []);
        }
        if (submissionsResponse.ok) {
          const result = await submissionsResponse.json();
          setSubmissions(result.submissions || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId]);

  const submissionByTemplate = useMemo(() => {
    const map = new Map<number, any>();
    for (const item of submissions) {
      const templateIdValue = Number(item.submission?.templateId);
      if (!map.has(templateIdValue)) map.set(templateIdValue, item);
    }
    return map;
  }, [submissions]);

  useEffect(() => {
    if (loading || !autoPrint || printedRef.current || !patient) return;
    printedRef.current = true;
    const openPrint = async () => {
      try {
        await document.fonts?.ready;
      } catch {
        /* ignore */
      }
      setTimeout(() => window.print(), 500);
    };
    openPrint();
  }, [loading, autoPrint, patient]);

  const printAll = () => window.print();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 size={36} className="animate-spin mb-3 text-[#0a6ebd]" />
        <div className="font-bold">جاري تجهيز جميع النماذج للطباعة...</div>
      </div>
    );
  }

  if (!patientId || !patient) {
    return (
      <div className="max-w-xl mx-auto my-16 card text-center">
        <div className="font-black text-lg mb-2">تعذر العثور على ملف المريض</div>
        <button onClick={() => router.push("/")} className="btn-primary mx-auto">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200/70 py-5">
      <div className="no-print max-w-5xl mx-auto px-3 mb-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-secondary"
            >
              <ArrowRight size={17} />
              الرئيسية
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-emerald-700">اكتملت النماذج الخمسة</div>
              <h1 className="font-black text-xl text-slate-900">طباعة جميع النماذج</h1>
              <div className="text-xs text-slate-500 mt-1">
                {patient.name} • {patient.patientId}
              </div>
            </div>
            <button type="button" onClick={printAll} className="btn-primary py-3">
              <Printer size={19} />
              طباعة جميع النماذج
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
            <Info size={17} className="shrink-0 mt-0.5" />
            <div>
              تم ترتيب صفحات كل نموذج ذي وجهين وراء بعضها مباشرة. أُضيفت صفحة خلفية فارغة بعد نموذج أوامر الطبيب لأنه صفحة واحدة، حتى يبدأ نموذج التثقيف الصحي على وجه ورقة جديد. من نافذة الطباعة اختر <b>الطباعة على الوجهين / Duplex</b> ثم التقليب على الحافة الطويلة.
            </div>
          </div>
        </div>
      </div>

      <div className="exam-print-preview-scroll">
        <div className="print-area exam-print-document">
          {templates.map((template, index) => {
            const stored = submissionByTemplate.get(Number(template.id));
            let formData = stored?.submission?.data || {};
            if (!stored) {
              try {
                const local = sessionStorage.getItem(`altadawy_exam_form_${template.id}`);
                if (local) formData = JSON.parse(local);
              } catch {
                /* ignore */
              }
            }
            const doctorName =
              formData?._doctorName || stored?.doctor?.name || "د. مصطفى الشناوي";
            const schema = template.schema;
            const landscape = isMultidisciplinaryCare(schema);

            return (
              <div key={template.id}>
                <section
                  className={`exam-print-form ${landscape ? "landscape" : "portrait"}`}
                  data-form-index={index + 1}
                >
                  {isHistoryExam(schema) && (
                    <HistoryExamForm
                      schema={schema}
                      data={formData}
                      patient={patient}
                      doctorName={doctorName}
                      readOnly
                    />
                  )}
                  {isMultidisciplinaryCare(schema) && (
                    <MultidisciplinaryCareForm
                      schema={schema}
                      data={formData}
                      patient={patient}
                      doctorName={doctorName}
                      readOnly
                    />
                  )}
                  {isPadua(schema) && (
                    <PaduaForm
                      schema={schema}
                      data={formData}
                      patient={patient}
                      doctorName={doctorName}
                      signedAt={stored?.submission?.updatedAt || new Date()}
                      readOnly
                    />
                  )}
                  {isDoctorOrders(schema) && (
                    <DoctorOrdersForm
                      schema={schema}
                      data={formData}
                      patient={patient}
                      doctorName={doctorName}
                      readOnly
                    />
                  )}
                  {isHealthEducation(schema) && (
                    <HealthEducationForm
                      schema={schema}
                      data={formData}
                      patient={patient}
                      readOnly
                    />
                  )}
                </section>

                {isDoctorOrders(schema) && (
                  <section className="exam-print-blank-page portrait" aria-label="صفحة خلفية فارغة">
                    <div className="no-print flex h-full items-center justify-center text-sm text-slate-400">
                      <Files size={18} className="ml-2" />
                      صفحة خلفية فارغة لضبط الطباعة على الوجهين
                    </div>
                  </section>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ExamPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-slate-500">
          جاري تجهيز النماذج...
        </div>
      }
    >
      <ExamPrintContent />
    </Suspense>
  );
}
