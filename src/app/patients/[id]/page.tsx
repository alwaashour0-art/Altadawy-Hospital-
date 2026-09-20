"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Plus, FileText, Clock, User, Activity } from "lucide-react";

export default function PatientFilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [patient, setPatient] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  const load = async () => {
    setLoading(true);
    const [patRes, tplRes] = await Promise.all([
      fetch(`/api/patients?id=${id}`),
      fetch("/api/templates"),
    ]);
    const patData = await patRes.json();
    setPatient(patData.patient);
    setSubmissions(patData.submissions || []);
    const tplData = await tplRes.json();
    setTemplates(tplData.templates || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-8 text-slate-500">جاري التحميل...</div>;
  }
  if (!patient) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 card text-center">
        المريض غير موجود
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    draft: "مسودة",
    in_progress: "قيد التعبئة",
    completed: "مكتمل",
    printed: "مطبوع",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/patients" className="inline-flex items-center gap-1 text-sm text-slate-600 mb-4 hover:text-[#0a6ebd]">
        <ArrowRight size={16} />
        العودة
      </Link>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              <span className="bg-blue-50 text-[#084e87] px-2.5 py-1 rounded font-mono font-bold">
                {patient.patientId}
              </span>
              {patient.age && (
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                  {patient.age} سنة
                </span>
              )}
              {patient.gender && (
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                  {patient.gender === "male" ? "ذكر" : "أنثى"}
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              className="btn-primary"
            >
              <Plus size={18} />
              إضافة نموذج جديد
            </button>
            {showTemplateMenu && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-10 max-h-96 overflow-auto">
                {templates.map((t) => (
                  <Link
                    key={t.id}
                    href={`/forms/${t.id}?patientId=${patient.id}`}
                    className="flex items-center gap-2 px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-0"
                  >
                    <FileText size={16} className="text-[#0a6ebd]" />
                    <span className="text-sm font-semibold">{t.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {patient.nationalId && (
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500">الرقم القومي</div>
              <div className="font-bold font-mono">{patient.nationalId}</div>
            </div>
          )}
          {patient.admissionDate && (
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500">تاريخ الدخول</div>
              <div className="font-bold">{new Date(patient.admissionDate).toLocaleDateString("ar-EG")}</div>
            </div>
          )}
          {patient.department && (
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500">القسم</div>
              <div className="font-bold">{patient.department}</div>
            </div>
          )}
          {patient.roomBed && (
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500">الغرفة/السرير</div>
              <div className="font-bold">{patient.roomBed}</div>
            </div>
          )}
          {patient.consultant && (
            <div className="bg-slate-50 rounded-lg p-3 md:col-span-2">
              <div className="text-xs text-slate-500">الطبيب المعالج</div>
              <div className="font-bold">{patient.consultant}</div>
            </div>
          )}
          {patient.diagnosis && (
            <div className="bg-slate-50 rounded-lg p-3 md:col-span-2">
              <div className="text-xs text-slate-500">التشخيص</div>
              <div className="font-bold">{patient.diagnosis}</div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Clock size={20} className="text-[#0a6ebd]" />
        التايم لاين
      </h2>

      {submissions.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          لا توجد نماذج بعد. ابدأ بإضافة نموذج جديد.
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <Link
              key={s.id}
              href={`/submissions/${s.id}`}
              className="card block hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0a6ebd] to-[#14a085] flex items-center justify-center text-white shrink-0">
                  <FileText size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800">{s.template?.name || "نموذج"}</h3>
                    <span className={`status-badge status-${s.status}`}>
                      {statusLabel[s.status] || s.status}
                    </span>
                    {s.score !== null && s.score !== undefined && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                        النتيجة: {s.score}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1">
                      <User size={13} />
                      {s.doctor?.name || "طبيب"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Activity size={13} />
                      {new Date(s.createdAt).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
