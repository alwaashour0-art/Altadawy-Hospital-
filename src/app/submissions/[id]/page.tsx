"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Printer, FileDown, CheckCircle2 } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";
import { ScoreGrid, LevelGrid } from "@/components/ScoreGrid";
import { Checklist } from "@/components/Checklist";
import { PaduaForm } from "@/components/PaduaForm";
import { HistoryExamForm } from "@/components/HistoryExamForm";
import { HealthEducationForm } from "@/components/HealthEducationForm";
import { DoctorOrdersForm } from "@/components/DoctorOrdersForm";
import { MultidisciplinaryCareForm } from "@/components/MultidisciplinaryCareForm";
import ResponsivePaperFrame from "@/components/ResponsivePaperFrame";
import { computeGridScore, isScoreGrid, isLevelGrid, isChecklist, isPadua, isHistoryExam, isHealthEducation, isDoctorOrders, isMultidisciplinaryCare } from "@/lib/formSchemas";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function SubmissionViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const rawSchema = data?.template?.schema;
  // Wide tables and the multidisciplinary care plan print in A4 landscape.
  const isGridTemplate =
    isScoreGrid(rawSchema) ||
    isLevelGrid(rawSchema) ||
    isMultidisciplinaryCare(rawSchema);
  const isCustomLayout = isGridTemplate || isChecklist(rawSchema) || isPadua(rawSchema) || isHistoryExam(rawSchema) || isHealthEducation(rawSchema) || isDoctorOrders(rawSchema) || isMultidisciplinaryCare(rawSchema);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/submissions?id=${id}`);
      const d = await res.json();
      setData(d);
      setLoading(false);
    })();
  }, [id]);

  const handlePrint = () => {
    window.print();
    if (data?.submission) {
      fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.submission.id, status: "printed" }),
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setGenerating(true);
    try {
      const wide = isGridTemplate;
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: wide ? 1123 : 794, // A4 landscape / portrait px
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

      pdf.save(
        `${data?.patient?.name || "patient"}-${data?.template?.name || "form"}.pdf`
      );
    } catch (e) {
      alert("خطأ في توليد الـ PDF");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-8 text-slate-500">جاري التحميل...</div>;
  if (!data) return <div className="card max-w-5xl mx-auto">غير موجود</div>;

  const { submission, template, patient, doctor } = data;
  const schema = template.schema as any;
  const filledData = (submission.data || {}) as Record<string, any>;

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 py-6 no-print">
        <Link href={`/patients/${patient.id}`} className="inline-flex items-center gap-1 text-sm text-slate-600 mb-4 hover:text-[#0a6ebd]">
          <ArrowRight size={16} />
          العودة لملف المريض
        </Link>

        <div className="card mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">{template.name}</h1>
            <div className="text-sm text-slate-500 mt-1">
              <span className="font-semibold">{patient.name}</span> •{" "}
              <span className="font-mono">{patient.patientId}</span> •{" "}
              {new Date(submission.createdAt).toLocaleString("ar-EG")}
            </div>
            <div className="flex gap-2 mt-2">
              <span className={`status-badge status-${submission.status}`}>
                {submission.status === "draft" && "مسودة"}
                {submission.status === "in_progress" && "قيد التعبئة"}
                {submission.status === "completed" && "مكتمل"}
                {submission.status === "printed" && "مطبوع"}
              </span>
              {submission.score !== null && submission.score !== undefined && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                  {submission.scoreLabel || `النتيجة: ${submission.score}`}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn-secondary">
              <Printer size={16} /> طباعة
            </button>
            <button onClick={handleDownloadPDF} className="btn-primary" disabled={generating}>
              <FileDown size={16} />
              {generating ? "جاري التوليد..." : "تحميل PDF"}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-2 pb-10">
        <ResponsivePaperFrame
          landscape={isGridTemplate}
          paperRef={printRef}
          className="no-print-parent"
        >
        <div className={isCustomLayout ? "" : "p-8"} dir="rtl">
          {/* Generic Header */}
          <div className={`flex items-start justify-between pb-4 border-b-4 border-[#0a6ebd] mb-4 ${isCustomLayout ? "hidden" : ""}`}>
            <div className="flex items-center gap-3">
              <LogoMark size={56} />
              <div>
                <div className="font-black text-lg text-[#084e87]">مستشفى التداوي</div>
                <div className="text-xs text-emerald-700 font-semibold">Altadawy Hospital - رعاية بلا حدود</div>
                <div className="text-[10px] text-slate-500 mt-0.5">معتمد من GAHAR</div>
              </div>
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-[#084e87]">{template.name}</div>
              <div className="text-slate-500 mt-1">
                التاريخ: {new Date(submission.createdAt).toLocaleDateString("ar-EG")}
              </div>
              <div className="text-slate-500">
                الوقت: {new Date(submission.createdAt).toLocaleTimeString("ar-EG")}
              </div>
            </div>
          </div>

          {/* Patient Info — hidden for replicas that print their own patient box */}
          <div className={`bg-slate-50 rounded-lg p-3 mb-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs border border-slate-200 ${isChecklist(schema) || isPadua(schema) || isHistoryExam(schema) || isHealthEducation(schema) || isDoctorOrders(schema) || isMultidisciplinaryCare(schema) ? "hidden" : ""}`}>
            <div>
              <span className="text-slate-500">اسم المريض:</span>{" "}
              <span className="font-bold">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-500">رقم الملف:</span>{" "}
              <span className="font-bold font-mono">{patient.patientId}</span>
            </div>
            {patient.age && (
              <div>
                <span className="text-slate-500">العمر:</span>{" "}
                <span className="font-bold">{patient.age} سنة</span>
              </div>
            )}
            {patient.gender && (
              <div>
                <span className="text-slate-500">النوع:</span>{" "}
                <span className="font-bold">{patient.gender === "male" ? "ذكر" : "أنثى"}</span>
              </div>
            )}
            {patient.nationalId && (
              <div>
                <span className="text-slate-500">الرقم القومي:</span>{" "}
                <span className="font-mono">{patient.nationalId}</span>
              </div>
            )}
            {patient.department && (
              <div>
                <span className="text-slate-500">القسم:</span>{" "}
                <span className="font-bold">{patient.department}</span>
              </div>
            )}
            {patient.roomBed && (
              <div>
                <span className="text-slate-500">الغرفة/السرير:</span>{" "}
                <span className="font-bold">{patient.roomBed}</span>
              </div>
            )}
            {patient.consultant && (
              <div className="col-span-2">
                <span className="text-slate-500">الطبيب المعالج:</span>{" "}
                <span className="font-bold">{patient.consultant}</span>
              </div>
            )}
          </div>

          {/* Grid layouts — exact paper replica */}
          {isScoreGrid(schema) && (
            <div className="my-3">
              <ScoreGrid
                schema={schema}
                data={filledData}
                patient={patient}
                doctorName={doctor?.name}
                readOnly
                compact
              />
            </div>
          )}
          {isLevelGrid(schema) && (
            <div className="my-3">
              <LevelGrid schema={schema} data={filledData} readOnly compact />
            </div>
          )}
          {isChecklist(schema) && (
            <div className="my-3">
              <Checklist
                schema={schema}
                data={filledData}
                patient={patient}
                doctorName={doctor?.name}
                readOnly
                compact
              />
            </div>
          )}
          {isPadua(schema) && (
            <div className="my-3">
              <PaduaForm
                schema={schema}
                data={filledData}
                patient={patient}
                doctorName={doctor?.name}
                signedAt={submission.updatedAt || submission.createdAt}
                readOnly
                compact
              />
            </div>
          )}
          {isHistoryExam(schema) && (
            <div className="my-3">
              <HistoryExamForm
                schema={schema}
                data={filledData}
                patient={patient}
                doctorName={doctor?.name}
                readOnly
                compact
              />
            </div>
          )}
          {isHealthEducation(schema) && (
            <div className="my-3">
              <HealthEducationForm
                schema={schema}
                data={filledData}
                patient={patient}
                readOnly
                compact
              />
            </div>
          )}
          {isDoctorOrders(schema) && (
            <div className="my-3">
              <DoctorOrdersForm
                schema={schema}
                data={filledData}
                patient={patient}
                doctorName={filledData.physicianSignature || doctor?.name}
                readOnly
                compact
              />
            </div>
          )}
          {isMultidisciplinaryCare(schema) && (
            <div className="my-3">
              <MultidisciplinaryCareForm
                schema={schema}
                data={filledData}
                patient={patient}
                doctorName={filledData.responsiblePhysician || doctor?.name}
                readOnly
                compact
              />
            </div>
          )}

          {/* Generic Sections */}
          {!isCustomLayout && schema?.sections?.map((section: any, si: number) => (
            <div key={si} className="mb-4">
              <h3 className="bg-gradient-to-l from-[#0a6ebd] to-[#14a085] text-white font-bold text-sm px-3 py-2 rounded mb-2">
                {section.title}
              </h3>
              <div className="space-y-1.5">
                {section.fields.map((f: any) => {
                  const v = filledData[f.key];
                  if (v === undefined || v === null || v === "") return null;
                  return (
                    <div key={f.key} className="flex gap-2 text-xs border-b border-dashed border-slate-200 pb-1">
                      <div className="font-semibold text-slate-700 shrink-0 w-40">{f.label}:</div>
                      <div className="flex-1 text-slate-900 break-words">
                        {f.type === "checkbox" ? (v ? "✓" : "✗") : String(v)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Score */}
          {!isCustomLayout && submission.score !== null && submission.score !== undefined && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 my-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-amber-500 text-white flex items-center justify-center text-2xl font-black shrink-0">
                {submission.score}
              </div>
              <div>
                <div className="text-xs text-amber-800 font-semibold">النتيجة الإجمالية</div>
                <div className="font-bold text-amber-900">{submission.scoreLabel}</div>
              </div>
            </div>
          )}

          {/* Generic Signature */}
          <div className={`mt-8 pt-4 border-t-2 border-slate-300 grid grid-cols-2 gap-6 text-sm ${isCustomLayout ? "hidden" : ""}`}>
            <div>
              <div className="text-slate-500 text-xs mb-1">اسم الطبيب</div>
              <div className="font-bold text-slate-800 border-b-2 border-slate-400 pb-1 inline-block px-2">
                {doctor.name}
              </div>
              {doctor.specialty && <div className="text-xs text-slate-500 mt-1">{doctor.specialty}</div>}
            </div>
            <div className="text-left">
              <div className="text-slate-500 text-xs mb-1">التاريخ والوقت</div>
              <div className="font-bold text-slate-800 border-b-2 border-slate-400 pb-1 inline-block px-2">
                {new Date(submission.updatedAt || submission.createdAt).toLocaleString("ar-EG")}
              </div>
            </div>
          </div>

          <div className={`mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 ${isCustomLayout ? "hidden" : ""}`}>
            مستشفى التداوي • نظام إلكتروني • تم إنشاء هذا النموذج في {new Date().toLocaleString("ar-EG")}
          </div>
        </div>
        </ResponsivePaperFrame>
      </div>
    </div>
  );
}
