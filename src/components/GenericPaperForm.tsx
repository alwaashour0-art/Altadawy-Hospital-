"use client";
import { LogoMark } from "@/components/LogoMark";

export function GenericPaperForm({
  template,
  data,
  patient,
  doctorName,
  onChange,
  onPatientChange,
  onDoctorChange,
  readOnly = false,
  compact = false,
}: {
  template: any;
  data: Record<string, any>;
  patient?: { name?: string; patientId?: string; department?: string; age?: any; gender?: string; roomBed?: string } | null;
  doctorName?: string;
  onChange?: (key: string, value: any) => void;
  onPatientChange?: (field: string, value: string) => void;
  onDoctorChange?: (name: string) => void;
  readOnly?: boolean;
  compact?: boolean;
}) {
  const schema = template?.schema;
  const sections = schema?.sections || [];

  const set = (k: string, v: any) => {
    if (readOnly || !onChange) return;
    onChange(k, v);
  };

  const fs = compact ? "text-[10px]" : "text-[13px]";
  const pad = compact ? "px-1.5 py-1" : "px-2.5 py-1.5";

  return (
    <div
      dir="rtl"
      className="w-full bg-white text-slate-900"
      style={{ fontFamily: "'Cairo', 'Times New Roman', serif" }}
    >
      {/* ===== Hospital Letterhead Header ===== */}
      <div className="flex items-start justify-between pb-3 mb-3 border-b-2 border-[#0a6ebd]">
        <div className="flex items-center gap-3">
          <LogoMark size={compact ? 44 : 56} />
          <div>
            <div className="font-black text-[#084e87]" style={{ fontSize: compact ? 15 : 20 }}>
              مستشفى التداوي
            </div>
            <div className="text-emerald-700 font-semibold" style={{ fontSize: compact ? 9 : 12 }}>
              Altadawy Hospital — رعاية بلا حدود
            </div>
            <div className="text-slate-400 text-[10px]">معتمد من GAHAR للهيئة العامة للاعتماد والرقابة الصحية</div>
          </div>
        </div>
        <div className="text-left text-xs text-slate-600 space-y-0.5">
          <div className="font-bold text-[#084e87]" style={{ fontSize: compact ? 12 : 14 }}>
            {template?.name}
          </div>
          <div>التاريخ: {new Date().toLocaleDateString("ar-EG")}</div>
          <div>الوقت: {new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>

      {/* ===== Patient Information Box ===== */}
      <div className="border border-slate-400 rounded-md p-2.5 mb-4 bg-slate-50/50 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <span className="text-slate-500">اسم المريض: </span>
            {readOnly ? (
              <span className="font-bold">{patient?.name || "………………"}</span>
            ) : (
              <input
                value={patient?.name || ""}
                onChange={(e) => onPatientChange?.("name", e.target.value)}
                placeholder="اسم المريض..."
                className="font-bold bg-transparent border-b border-dotted border-slate-400 outline-none focus:border-[#0a6ebd] w-full"
              />
            )}
          </div>
          <div>
            <span className="text-slate-500">رقم الملف: </span>
            {readOnly ? (
              <span className="font-bold font-mono">{patient?.patientId || "………………"}</span>
            ) : (
              <input
                value={patient?.patientId || ""}
                onChange={(e) => onPatientChange?.("patientId", e.target.value)}
                placeholder="الرقم الطبي..."
                className="font-bold font-mono bg-transparent border-b border-dotted border-slate-400 outline-none focus:border-[#0a6ebd] w-full"
              />
            )}
          </div>
          <div>
            <span className="text-slate-500">القسم: </span>
            {readOnly ? (
              <span className="font-bold">{patient?.department || "………………"}</span>
            ) : (
              <input
                value={patient?.department || ""}
                onChange={(e) => onPatientChange?.("department", e.target.value)}
                placeholder="القسم..."
                className="font-bold bg-transparent border-b border-dotted border-slate-400 outline-none focus:border-[#0a6ebd] w-full"
              />
            )}
          </div>
          <div>
            <span className="text-slate-500">الغرفة / السرير: </span>
            {readOnly ? (
              <span className="font-bold">{patient?.roomBed || "………………"}</span>
            ) : (
              <input
                value={patient?.roomBed || ""}
                onChange={(e) => onPatientChange?.("roomBed", e.target.value)}
                placeholder="الغرفة/السرير..."
                className="font-bold bg-transparent border-b border-dotted border-slate-400 outline-none focus:border-[#0a6ebd] w-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* ===== Title ===== */}
      <h1
        className="text-center font-bold text-[#084e87] mb-4 pb-1 border-b border-slate-300"
        style={{ fontSize: compact ? 15 : 22 }}
      >
        {template?.name}
      </h1>

      {/* ===== Sections & Fields (styled like clean paper rows) ===== */}
      <div className="space-y-4">
        {sections.map((section: any, si: number) => (
          <div key={si} className="border border-slate-400 rounded-md overflow-hidden">
            <div
              className="bg-slate-100 px-3 py-1.5 font-bold text-[#084e87] border-b border-slate-300"
              style={{ fontSize: compact ? 11 : 14 }}
            >
              {section.title}
            </div>
            <div className="divide-y divide-slate-200">
              {section.fields?.map((field: any) => {
                const val = data[field.key];
                const isCheck = field.type === "checkbox";
                const isRadio = field.type === "radio";
                const isTextarea = field.type === "textarea";

                if (isCheck) {
                  const on = !!val;
                  return (
                    <div
                      key={field.key}
                      onClick={() => set(field.key, on ? "" : true)}
                      className={`flex items-center justify-between ${pad} ${
                        readOnly ? "" : "cursor-pointer hover:bg-blue-50/50"
                      } ${on ? "bg-emerald-50/60" : ""}`}
                    >
                      <span className={`${fs} font-semibold`}>
                        {field.label}
                        {field.required && <span className="text-red-500 mr-1">*</span>}
                      </span>
                      <span
                        className={`w-6 h-6 border-2 border-slate-700 rounded flex items-center justify-center font-bold ${
                          on ? "bg-[#0a6ebd] border-[#0a6ebd] text-white" : "bg-white"
                        }`}
                        style={{ fontSize: compact ? 11 : 14 }}
                      >
                        {on ? "✓" : ""}
                      </span>
                    </div>
                  );
                }

                if (isRadio && field.options) {
                  return (
                    <div key={field.key} className={`${pad} flex flex-wrap items-center gap-3`}>
                      <span className={`${fs} font-semibold min-w-[140px]`}>
                        {field.label}:
                        {field.required && <span className="text-red-500 mr-1">*</span>}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {field.options.map((opt: string) => {
                          const sel = val === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={readOnly}
                              onClick={() => set(field.key, opt)}
                              className={`px-2.5 py-0.5 rounded border text-xs font-semibold transition ${
                                sel
                                  ? "bg-[#0a6ebd] text-white border-[#0a6ebd]"
                                  : "border-slate-300 bg-white hover:bg-slate-100"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (isTextarea) {
                  return (
                    <div key={field.key} className={pad}>
                      <div className={`${fs} font-semibold mb-1`}>
                        {field.label}:
                        {field.required && <span className="text-red-500 mr-1">*</span>}
                      </div>
                      {readOnly ? (
                        <div className="border border-slate-200 rounded p-2 bg-slate-50 min-h-[50px] whitespace-pre-wrap text-xs">
                          {val || "—"}
                        </div>
                      ) : (
                        <textarea
                          value={val || ""}
                          onChange={(e) => set(field.key, e.target.value)}
                          placeholder="اضغط واكتب هنا..."
                          rows={3}
                          className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-[#0a6ebd] focus:bg-blue-50/30"
                        />
                      )}
                    </div>
                  );
                }

                return (
                  <div key={field.key} className={`flex items-baseline gap-2 ${pad}`}>
                    <span className={`${fs} font-semibold shrink-0 min-w-[130px]`}>
                      {field.label}:
                      {field.required && <span className="text-red-500 mr-1">*</span>}
                    </span>
                    {readOnly ? (
                      <span className="flex-1 font-bold border-b border-dotted border-slate-400 pb-0.5 text-xs">
                        {val || "—"}
                      </span>
                    ) : (
                      <input
                        value={val || ""}
                        onChange={(e) => set(field.key, e.target.value)}
                        placeholder="اضغط واكتب هنا..."
                        className="flex-1 border-b border-dotted border-slate-400 font-medium px-1 py-0.5 outline-none focus:border-[#0a6ebd] bg-transparent text-xs"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Signature / Footer ===== */}
      <div className="mt-8 pt-4 border-t-2 border-slate-400 grid grid-cols-2 gap-6 text-xs">
        <div>
          <div className="text-slate-500 mb-1">اسم الطبيب المسؤول:</div>
          {readOnly ? (
            <div className="font-bold border-b-2 border-slate-600 pb-1 inline-block min-w-[180px]">
              {doctorName || "………………………………"}
            </div>
          ) : (
            <input
              value={doctorName || ""}
              onChange={(e) => onDoctorChange?.(e.target.value)}
              placeholder="اسم الطبيب..."
              className="font-bold border-b-2 border-slate-600 pb-1 inline-block min-w-[180px] outline-none focus:border-[#0a6ebd] bg-transparent"
            />
          )}
        </div>
        <div className="text-left">
          <div className="text-slate-500 mb-1">التاريخ والوقت:</div>
          <div className="font-bold border-b-2 border-slate-600 pb-1 inline-block min-w-[180px]">
            {new Date().toLocaleDateString("ar-EG")} — {new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-[10px] text-slate-400">
        مستشفى التداوي • نظام السجلات الطبية الإلكترونية المعتمد
      </div>
    </div>
  );
}
