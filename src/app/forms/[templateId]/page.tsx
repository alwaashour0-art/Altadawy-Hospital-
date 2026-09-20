"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  FileDown,
  ArrowRight,
  Save,
  CheckCircle2,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flag,
} from "lucide-react";
import { ScoreGrid, LevelGrid } from "@/components/ScoreGrid";
import { Checklist } from "@/components/Checklist";
import { PaduaForm } from "@/components/PaduaForm";
import { GenericPaperForm } from "@/components/GenericPaperForm";
import { HistoryExamForm } from "@/components/HistoryExamForm";
import { HealthEducationForm } from "@/components/HealthEducationForm";
import { DoctorOrdersForm } from "@/components/DoctorOrdersForm";
import { MultidisciplinaryCareForm } from "@/components/MultidisciplinaryCareForm";
import ResponsivePaperFrame from "@/components/ResponsivePaperFrame";
import {
  isScoreGrid,
  isLevelGrid,
  isChecklist,
  isPadua,
  isHistoryExam,
  isHealthEducation,
  isDoctorOrders,
  isMultidisciplinaryCare,
} from "@/lib/formSchemas";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function FormPaperInner() {
  const params = useParams();
  const router = useRouter();
  const sp = useSearchParams();
  const templateId = params.templateId as string;
  const initialPatientId = sp.get("patientId");
  const startsNewWorkflow = sp.get("start") === "1";

  const [template, setTemplate] = useState<any>(null);
  const [workflowTemplates, setWorkflowTemplates] = useState<any[]>([]);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [data, setData] = useState<Record<string, any>>({});
  const [patient, setPatient] = useState<{
    id?: number;
    name: string;
    patientId: string;
    department: string;
    roomBed: string;
  }>({
    name: "",
    patientId: "",
    department: "",
    roomBed: "",
  });
  const [doctorName, setDoctorName] = useState<string>("");
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setTemplate(null);
      setData({});
      setSubmissionId(null);
      try {
        if (startsNewWorkflow && !initialPatientId) {
          try {
            sessionStorage.removeItem("altadawy_exam_patient");
            for (const key of Object.keys(sessionStorage)) {
              if (key.startsWith("altadawy_exam_form_")) {
                sessionStorage.removeItem(key);
              }
            }
          } catch {
            /* ignore */
          }
        }

        const [templateResponse, workflowResponse] = await Promise.all([
          fetch(`/api/templates?id=${templateId}`),
          fetch("/api/templates"),
        ]);
        if (templateResponse.ok) {
          const templateData = await templateResponse.json();
          setTemplate(templateData.template);
        }
        if (workflowResponse.ok) {
          const workflowData = await workflowResponse.json();
          setWorkflowTemplates(workflowData.templates || []);
        }

        if (initialPatientId) {
          try {
            const [patientResponse, submissionsResponse] = await Promise.all([
              fetch(`/api/patients?id=${initialPatientId}`),
              fetch(`/api/submissions?patientId=${initialPatientId}`),
            ]);
            if (patientResponse.ok) {
              const patientData = await patientResponse.json();
              if (patientData.patient) {
                setPatient({
                  id: patientData.patient.id,
                  name: patientData.patient.name || "",
                  patientId: patientData.patient.patientId || "",
                  department: patientData.patient.department || "",
                  roomBed: patientData.patient.roomBed || "",
                });
              }
            }
            if (submissionsResponse.ok) {
              const submissionsData = await submissionsResponse.json();
              const existing = (submissionsData.submissions || []).find(
                (item: any) =>
                  Number(item.submission?.templateId) === Number(templateId)
              );
              if (existing?.submission) {
                setSubmissionId(existing.submission.id);
                setData(existing.submission.data || {});
                if (existing.submission.data?._doctorName) {
                  setDoctorName(existing.submission.data._doctorName);
                }
              }
            }
          } catch {
            /* ignore */
          }
        } else {
          try {
            const storedPatient = sessionStorage.getItem("altadawy_exam_patient");
            const storedForm = sessionStorage.getItem(
              `altadawy_exam_form_${templateId}`
            );
            if (storedPatient) setPatient(JSON.parse(storedPatient));
            if (storedForm) setData(JSON.parse(storedForm));
          } catch {
            /* ignore */
          }
        }

        if (!doctorName) {
          setDoctorName("د. مصطفى الشناوي");
        }

        try {
          const allPatientsResponse = await fetch("/api/patients");
          if (allPatientsResponse.ok) {
            const allPatients = await allPatientsResponse.json();
            setPatientsList(allPatients.patients || []);
          }
        } catch {
          /* ignore */
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [templateId, initialPatientId, startsNewWorkflow]);

  const updateField = (key: string, value: any) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const handlePatientField = (field: string, val: string) => {
    setPatient((p) => ({ ...p, [field]: val }));
  };

  useEffect(() => {
    if (loading) return;
    try {
      sessionStorage.setItem("altadawy_exam_patient", JSON.stringify(patient));
    } catch {
      /* ignore */
    }
  }, [patient, loading]);

  useEffect(() => {
    if (loading) return;
    try {
      sessionStorage.setItem(
        `altadawy_exam_form_${templateId}`,
        JSON.stringify({ ...data, _doctorName: doctorName })
      );
    } catch {
      /* ignore */
    }
  }, [data, doctorName, loading, templateId]);

  const selectExistingPatient = (pid: string) => {
    const found = patientsList.find((p) => String(p.id) === pid);
    if (found) {
      setPatient({
        id: found.id,
        name: found.name || "",
        patientId: found.patientId || "",
        department: found.department || "",
        roomBed: found.roomBed || "",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setGeneratingPdf(true);
    try {
      const wide =
        isScoreGrid(template?.schema) ||
        isMultidisciplinaryCare(template?.schema);
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: wide ? 1123 : 794,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: wide ? "l" : "p",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = wide ? 297 : 210;
      const pageHeight = wide ? 210 : 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${patient.name || "patient"}-${template?.name || "form"}.pdf`);
    } catch {
      alert("تعذر توليد ملف الـ PDF. يمكنك استخدام زر الطباعة العادي.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const saveCurrentForm = async (
    showMessage = true
  ): Promise<number | null> => {
    if (!patient.name.trim()) {
      alert("يرجى كتابة اسم المريض أولاً قبل الانتقال للسؤال التالي.");
      return null;
    }

    setSaving(true);
    try {
      let currentPatientId: number | null = patient.id ?? null;

      if (!currentPatientId) {
        const createResponse = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: patient.name.trim(),
            patientId: patient.patientId || undefined,
            department: patient.department,
            roomBed: patient.roomBed,
          }),
        });
        const createResult = await createResponse.json();
        if (!createResponse.ok || !createResult.patient) {
          throw new Error(createResult.error || "تعذر إنشاء ملف المريض");
        }
        currentPatientId = createResult.patient.id;
        setPatient((current) => ({
          ...current,
          id: createResult.patient.id,
          patientId: createResult.patient.patientId || current.patientId,
        }));
      } else {
        await fetch("/api/patients", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: currentPatientId,
            name: patient.name.trim(),
            patientId: patient.patientId,
            department: patient.department,
            roomBed: patient.roomBed,
          }),
        });
      }

      const submissionPayload = {
        templateId: Number(templateId),
        patientId: currentPatientId,
        data: { ...data, _doctorName: doctorName },
        status: "completed",
      };

      if (submissionId) {
        const updateResponse = await fetch("/api/submissions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: submissionId,
            data: submissionPayload.data,
            status: "completed",
          }),
        });
        if (!updateResponse.ok) {
          const updateResult = await updateResponse.json();
          throw new Error(updateResult.error || "تعذر تحديث النموذج");
        }
      } else {
        const submissionResponse = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionPayload),
        });
        const submissionResult = await submissionResponse.json();
        if (!submissionResponse.ok || !submissionResult.submission) {
          throw new Error(submissionResult.error || "تعذر حفظ النموذج");
        }
        setSubmissionId(submissionResult.submission.id);
      }

      try {
        sessionStorage.setItem(
          "altadawy_exam_patient",
          JSON.stringify({ ...patient, id: currentPatientId })
        );
      } catch {
        /* ignore */
      }

      if (showMessage) {
        setSavedMsg("تم حفظ النموذج الحالي بنجاح ✓");
        setTimeout(() => setSavedMsg(""), 3500);
      }
      return currentPatientId;
    } catch (error: any) {
      alert(error?.message || "حدث خطأ في الحفظ");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToDb = async () => {
    await saveCurrentForm(true);
  };

  const currentStepIndex = workflowTemplates.findIndex(
    (item) => Number(item.id) === Number(templateId)
  );
  const previousTemplate =
    currentStepIndex > 0 ? workflowTemplates[currentStepIndex - 1] : null;
  const nextTemplate =
    currentStepIndex >= 0 && currentStepIndex < workflowTemplates.length - 1
      ? workflowTemplates[currentStepIndex + 1]
      : null;

  const goToTemplate = (target: any, patientRecordId?: number | null) => {
    if (!target) return;
    const patientQuery = patientRecordId
      ? `&patientId=${patientRecordId}`
      : "";
    router.push(`/forms/${target.id}?workflow=1${patientQuery}`);
  };

  const handleNext = async () => {
    const patientRecordId = await saveCurrentForm(false);
    if (!patientRecordId) return;
    if (nextTemplate) {
      goToTemplate(nextTemplate, patientRecordId);
    } else {
      router.push(`/exam/print?patientId=${patientRecordId}&autoprint=1`);
    }
  };

  const handlePrevious = async () => {
    if (!previousTemplate) return;
    let patientRecordId = patient.id ?? null;
    if (patient.name.trim()) {
      patientRecordId = await saveCurrentForm(false);
      if (!patientRecordId) return;
    }
    goToTemplate(previousTemplate, patientRecordId);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <Loader2 className="animate-spin inline-block mb-2" size={32} />
        <div>جاري فتح النموذج...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center card">
        <div className="text-xl font-bold mb-2">النموذج غير موجود</div>
        <Link href="/" className="btn-primary inline-flex">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const schema = template.schema;
  const isLandscape =
    isScoreGrid(schema) || isMultidisciplinaryCare(schema);

  return (
    <div className="min-h-screen bg-slate-100/80 px-0 sm:px-2">
      {/* ===== Responsive A4 paper preview ===== */}
      <div className="w-full pb-4">
        <ResponsivePaperFrame
          landscape={isLandscape}
          paperRef={printRef}
          className="p-6 sm:p-10 transition"
        >
          {isScoreGrid(schema) && (
            <ScoreGrid
              schema={schema}
              data={data}
              patient={patient}
              doctorName={doctorName}
              onChange={updateField}
              onPatientChange={handlePatientField}
              onDoctorChange={setDoctorName}
            />
          )}

          {isLevelGrid(schema) && (
            <LevelGrid
              schema={schema}
              data={data}
              onChange={updateField}
            />
          )}

          {isChecklist(schema) && (
            <Checklist
              schema={schema}
              data={data}
              patient={patient}
              doctorName={doctorName}
              onChange={updateField}
              onPatientChange={handlePatientField}
              onDoctorChange={setDoctorName}
            />
          )}

           {isPadua(schema) && (
            <PaduaForm
              schema={schema}
              data={data}
              patient={patient}
              doctorName={doctorName}
              onChange={updateField}
              onPatientChange={handlePatientField}
              onDoctorChange={setDoctorName}
            />
          )}

          {isHistoryExam(schema) && (
            <HistoryExamForm
              schema={schema}
              data={data}
              patient={patient}
              doctorName={doctorName}
              onChange={updateField}
              onPatientChange={handlePatientField}
              onDoctorChange={setDoctorName}
            />
          )}

          {isHealthEducation(schema) && (
            <HealthEducationForm
              schema={schema}
              data={data}
              patient={patient}
              onChange={updateField}
              onPatientChange={handlePatientField}
            />
          )}

          {isDoctorOrders(schema) && (
            <DoctorOrdersForm
              schema={schema}
              data={data}
              patient={patient}
              doctorName={doctorName}
              onChange={updateField}
              onPatientChange={handlePatientField}
              onDoctorChange={setDoctorName}
            />
          )}

          {isMultidisciplinaryCare(schema) && (
            <MultidisciplinaryCareForm
              schema={schema}
              data={data}
              patient={patient}
              doctorName={doctorName}
              onChange={updateField}
              onPatientChange={handlePatientField}
              onDoctorChange={setDoctorName}
            />
          )}

          {!isScoreGrid(schema) &&
            !isLevelGrid(schema) &&
            !isChecklist(schema) &&
            !isPadua(schema) &&
            !isHistoryExam(schema) &&
            !isHealthEducation(schema) &&
            !isDoctorOrders(schema) &&
            !isMultidisciplinaryCare(schema) && (
              <GenericPaperForm
                template={template}
                data={data}
                patient={patient}
                doctorName={doctorName}
                onChange={updateField}
                onPatientChange={handlePatientField}
                onDoctorChange={setDoctorName}
              />
            )}
        </ResponsivePaperFrame>
      </div>

      <section className="no-print mx-auto mb-12 mt-4 w-[calc(100%-1rem)] max-w-[1200px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200 hover:text-[#0a6ebd]"
          >
            <ArrowRight size={15} />
            الرئيسية
          </Link>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black text-[#0a6ebd] sm:text-[11px]">
              النموذج {Math.max(1, currentStepIndex + 1)} من {workflowTemplates.length || 5}
            </div>
            <div className="truncate text-xs font-black text-slate-800 sm:text-sm">
              {template.name}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="btn-primary !gap-1 !px-2.5 !py-2 text-xs font-bold shadow-md"
              title="طباعة الورقة"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">طباعة</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPdf}
              className="btn-secondary !gap-1 !px-2.5 !py-2 text-xs font-bold"
              title="تحميل PDF"
            >
              <FileDown size={15} />
              <span className="hidden sm:inline">
                {generatingPdf ? "جاري..." : "PDF"}
              </span>
            </button>
            <button
              onClick={handleSaveToDb}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              title="حفظ في السجل"
            >
              <Save size={15} />
              <span className="hidden sm:inline">حفظ</span>
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {workflowTemplates.map((item, index) => {
            const active = index === currentStepIndex;
            const completed = index < currentStepIndex;
            return (
              <div key={item.id} className="min-w-0">
                <div
                  className={`h-1.5 rounded-full transition ${
                    active
                      ? "bg-[#0a6ebd]"
                      : completed
                      ? "bg-emerald-500"
                      : "bg-slate-200"
                  }`}
                />
                <div
                  className={`mt-0.5 hidden truncate text-center text-[9px] font-bold md:block ${
                    active ? "text-[#0a6ebd]" : "text-slate-400"
                  }`}
                >
                  {index + 1}. {item.name}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={!previousTemplate || saving}
            className="btn-secondary !gap-1 !px-3 !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
            السابق
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="btn-primary min-w-0 flex-1 justify-center !gap-1 !px-3 !py-2 text-xs disabled:cursor-wait disabled:opacity-60 sm:text-sm"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : nextTemplate ? (
              <ChevronLeft size={16} />
            ) : (
              <Flag size={16} />
            )}
            <span className="truncate">
              {saving
                ? "جاري الحفظ..."
                : nextTemplate
                ? `التالي: ${nextTemplate.name}`
                : "إنهاء وطباعة جميع النماذج"}
            </span>
          </button>
        </div>

        {savedMsg && (
          <div className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 p-1.5 text-center text-[10px] font-bold text-emerald-700 sm:text-xs">
            <CheckCircle2 size={13} />
            {savedMsg}
          </div>
        )}
      </section>
    </div>
  );
}

export default function FormPaperPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
          <Loader2 className="animate-spin inline-block mb-2" size={32} />
          <div>جاري فتح النموذج...</div>
        </div>
      }
    >
      <FormPaperInner />
    </Suspense>
  );
}
