"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function PatientsPage() {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (query: string) => {
    setLoading(true);
    const res = await fetch(`/api/patients?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setPatients(data.patients || []);
    setLoading(false);
  };

  useEffect(() => {
    load("");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    load(q);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">ملفات المرضى</h1>
      </div>

      <form onSubmit={handleSubmit} className="card mb-6 flex gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم، رقم الملف، الطبيب المعالج، أو التشخيص..."
            className="input pr-10"
          />
        </div>
        <button type="submit" className="btn-primary">
          بحث
        </button>
      </form>

      {loading ? (
        <div className="card text-center py-12 text-slate-500">جاري التحميل...</div>
      ) : patients.length === 0 ? (
        <div className="card text-center py-12 text-slate-500">
          لا توجد ملفات مرضى مسجلة حالياً. يتم إنشاء الملف تلقائياً عند حفظ أي نموذج طبي باسم المريض.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => (
            <Link
              key={p.id}
              href={`/patients/${p.id}`}
              className="card hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800">{p.name}</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">
                  {p.patientId}
                </span>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                {p.age && p.gender && (
                  <div>
                    <span className="text-slate-400">العمر:</span> {p.age} سنة • {p.gender === "male" ? "ذكر" : "أنثى"}
                  </div>
                )}
                {p.diagnosis && (
                  <div>
                    <span className="text-slate-400">التشخيص:</span> {p.diagnosis}
                  </div>
                )}
                {p.consultant && (
                  <div>
                    <span className="text-slate-400">الطبيب:</span> {p.consultant}
                  </div>
                )}
                {p.department && (
                  <div>
                    <span className="text-slate-400">القسم:</span> {p.department}
                    {p.roomBed && ` • ${p.roomBed}`}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
