"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, FileText } from "lucide-react";

function SearchInner() {
  const sp = useSearchParams();
  const q = sp.get("q") || "";
  const [patients, setPatients] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }
    (async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const d = await res.json();
      setPatients(d.patients || []);
      setSubmissions(d.submissions || []);
      setLoading(false);
    })();
  }, [q]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        نتائج البحث عن: <span className="gradient-text">&quot;{q}&quot;</span>
      </h1>

      {loading ? (
        <div className="card text-slate-500">جاري البحث...</div>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <User size={18} className="text-[#0a6ebd]" />
              المرضى ({patients.length})
            </h2>
            {patients.length === 0 ? (
              <div className="card text-slate-500">لا يوجد مرضى</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {patients.map((p) => (
                  <Link key={p.id} href={`/patients/${p.id}`} className="card hover:shadow-md">
                    <div className="font-bold">{p.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{p.patientId}</div>
                    {p.diagnosis && <div className="text-xs text-slate-600 mt-1">{p.diagnosis}</div>}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <FileText size={18} className="text-[#14a085]" />
              النماذج ({submissions.length})
            </h2>
            {submissions.length === 0 ? (
              <div className="card text-slate-500">لا توجد نماذج</div>
            ) : (
              <div className="space-y-2">
                {submissions.map((s) => (
                  <Link
                    key={s.submission.id}
                    href={`/submissions/${s.submission.id}`}
                    className="card block hover:shadow-md"
                  >
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="font-bold">{s.template?.name}</div>
                        <div className="text-xs text-slate-500">
                          {s.patient?.name} ({s.patient?.patientId}) • {s.doctor?.name}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(s.submission.createdAt).toLocaleDateString("ar-EG")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-8 text-slate-500">جاري البحث...</div>}>
      <SearchInner />
    </Suspense>
  );
}
