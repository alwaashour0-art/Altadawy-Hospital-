"use client";
import { ChecklistSchema, countChecklistMarks } from "@/lib/formSchemas";

export function Checklist({
  schema,
  data,
  patient,
  doctorName,
  onChange,
  onPatientChange,
  onDoctorChange,
  readOnly = false,
  showErrors = false,
  compact = false,
}: {
  schema: ChecklistSchema;
  data: Record<string, any>;
  patient?: { name?: string; patientId?: string } | null;
  doctorName?: string;
  onChange?: (key: string, value: any) => void;
  onPatientChange?: (field: "name" | "patientId", value: string) => void;
  onDoctorChange?: (name: string) => void;
  readOnly?: boolean;
  showErrors?: boolean;
  compact?: boolean;
}) {
  const marks = countChecklistMarks(schema, data);
  const set = (k: string, v: any) => {
    if (readOnly || !onChange) return;
    onChange(k, v);
  };

  const fs = compact ? "text-[9px]" : "text-[13px]";
  const cellPad = compact ? "px-1 py-[3px]" : "px-2 py-1.5";

  return (
    <div dir="ltr" className="w-full bg-white" style={{ fontFamily: "'Times New Roman', Cairo, serif" }}>
      {/* ===== Patient box (top-left as printed) ===== */}
      {schema.patientBox && (
        <div className="flex mb-6">
          <table className="border-2 border-slate-900 border-collapse" dir="rtl">
            <tbody>
              {schema.patientBox.map((p) => {
                const val =
                  p.value === "name" ? patient?.name : patient?.patientId;
                return (
                  <tr key={p.value}>
                    <td className={`${cellPad} ${fs} font-semibold whitespace-nowrap align-middle`}>
                      {p.label}
                    </td>
                    <td className={`${cellPad} ${fs} align-middle`} style={{ minWidth: compact ? 120 : 190 }}>
                      {readOnly ? (
                        val ? (
                          <span className="font-bold">{val}</span>
                        ) : (
                          <span className="text-slate-400 tracking-widest">………………………………</span>
                        )
                      ) : (
                        <input
                          value={val || ""}
                          onChange={(e) => onPatientChange?.(p.value, e.target.value)}
                          placeholder="اضغط واكتب هنا..."
                          className="w-full bg-transparent font-bold outline-none border-b border-transparent focus:border-[#0a6ebd] text-right"
                          style={{ minWidth: 140 }}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Title ===== */}
      <h2
        className="text-center font-bold mb-4 text-slate-900"
        style={{ fontSize: compact ? 15 : 26 }}
      >
        {schema.headerTitle}
      </h2>

      {/* ===== Main table ===== */}
      <table
        className={`border-collapse mx-auto ${fs}`}
        style={{ width: compact ? "100%" : "88%", border: "1px solid #000" }}
      >
        <thead>
          <tr className="bg-[#d9d9d9]">
            <th className={`border border-black ${cellPad} font-normal text-center`} style={{ width: "11%" }}>
              {schema.columns.no}
            </th>
            <th className={`border border-black ${cellPad} font-normal text-center`}>
              {schema.columns.name}
            </th>
            <th className={`border border-black ${cellPad} font-normal text-center`} style={{ width: "17%" }}>
              {schema.columns.mark}
            </th>
          </tr>
        </thead>
        <tbody>
          {schema.rows.map((row) => {
            const checked = !!data[row.key];
            return (
              <tr
                key={row.key}
                onClick={() => set(row.key, checked ? "" : true)}
                className={
                  readOnly
                    ? ""
                    : `cursor-pointer transition ${checked ? "bg-[#dcefe6]" : "hover:bg-[#eef5fc]"}`
                }
              >
                <td className={`border border-black ${cellPad} text-center align-middle`}>
                  {row.no}
                </td>
                <td className={`border border-black ${cellPad} text-center align-middle whitespace-pre-line leading-snug`}>
                  {row.text}
                </td>
                <td className={`border border-black ${cellPad} text-center align-middle`}>
                  {checked ? (
                    <span
                      className="font-bold text-[#0d7a65]"
                      style={{ fontSize: compact ? 12 : 18, lineHeight: 1 }}
                    >
                      ✓
                    </span>
                  ) : readOnly ? (
                    <span>&nbsp;</span>
                  ) : (
                    <span className="text-slate-300 select-none" style={{ fontSize: compact ? 10 : 15 }}>
                      ✓
                    </span>
                  )}
                </td>
              </tr>
            );
          })}

          {/* Number of marks row (auto) */}
          <tr>
            <td
              colSpan={2}
              className={`border border-black ${cellPad} align-middle font-semibold`}
              style={{ textAlign: "left", paddingLeft: compact ? 6 : 10 }}
            >
              {schema.totalRowLabel}
            </td>
            <td className={`border border-black ${cellPad} text-center align-middle font-bold`}>
              <span style={{ fontSize: compact ? 12 : 17 }}>{marks || ""}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {schema.caption && (
        <div className="text-center mt-1.5 mb-4" style={{ fontSize: compact ? 9 : 14 }}>
          {schema.caption}
        </div>
      )}

      {/* ===== Footer fields ===== */}
      <div className={`space-y-3 ${compact ? "mt-2" : "mt-5"}`} style={{ fontSize: compact ? 9 : 13 }}>
        {schema.footerFields?.map((f) => {
          const v = data[f.key];
          const missing = showErrors && f.required && (v === undefined || v === null || v === "");

          if (f.type === "radio") {
            return (
              <div key={f.key} className="flex flex-wrap items-center gap-2">
                <span>{f.before}</span>
                <span>(</span>
                {f.options?.map((o, i) => {
                  const sel = v === o;
                  if (readOnly) {
                    return (
                      <span key={o}>
                        {i > 0 && <span className="mx-1">-</span>}
                        <span className={sel ? "font-bold underline decoration-2" : "text-slate-400 line-through"}>
                          {o}
                        </span>
                      </span>
                    );
                  }
                  return (
                    <span key={o} className="inline-flex items-center">
                      {i > 0 && <span className="mx-1">-</span>}
                      <button
                        type="button"
                        onClick={() => set(f.key, sel ? "" : o)}
                        className={`px-2 py-0.5 rounded border transition ${
                          sel
                            ? "bg-[#0a6ebd] text-white border-[#0a6ebd] font-bold"
                            : missing
                            ? "border-red-400 bg-red-50 text-red-700 hover:bg-red-100"
                            : "border-slate-400 bg-white hover:bg-blue-50 hover:border-[#0a6ebd]"
                        }`}
                      >
                        {o}
                      </button>
                    </span>
                  );
                })}
                <span>)</span>
                <span>{f.after}</span>
                {missing && <span className="text-red-600 font-bold">*</span>}
              </div>
            );
          }

          return (
            <div key={f.key} className="flex flex-wrap items-baseline gap-2">
              <span>{f.before}</span>
              {readOnly ? (
                <span className="font-bold border-b border-black px-3 min-w-[70px] inline-block text-center">
                  {v || "……"}
                </span>
              ) : (
                <input
                  value={v ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={`px-2 py-0.5 border-b-2 bg-transparent text-center font-bold outline-none transition ${
                    missing
                      ? "border-red-500 bg-red-50"
                      : "border-slate-400 focus:border-[#0a6ebd] focus:bg-blue-50"
                  }`}
                  style={{ width: compact ? 70 : 110 }}
                />
              )}
              {f.hint && <span dir="rtl" className="text-slate-600">{f.hint}</span>}
              {missing && <span className="text-red-600 font-bold">*</span>}
            </div>
          );
        })}

        {/* Signature */}
        {schema.signatureLabel && (
          <div className="pt-2">
            <div className="font-semibold">{schema.signatureLabel}</div>
            {readOnly ? (
              <div className="border-b border-dotted border-black inline-block min-w-[220px] pb-0.5 font-bold">
                {doctorName || <span className="text-slate-400">………………………………</span>}
              </div>
            ) : (
              <input
                value={doctorName || ""}
                onChange={(e) => onDoctorChange?.(e.target.value)}
                placeholder="اسم الطبيب المسؤول..."
                className="border-b border-dotted border-black inline-block min-w-[220px] pb-0.5 font-bold outline-none focus:border-[#0a6ebd] bg-transparent"
              />
            )}
          </div>
        )}
      </div>

      {/* ===== Static blocks ===== */}
      {schema.staticBlocks?.map((b, i) => (
        <div key={i} className={compact ? "mt-3" : "mt-6"} style={{ fontSize: compact ? 8 : 12 }}>
          {b.title && <div className="font-semibold mb-2">{b.title}</div>}
          {b.paragraphs.map((p, pi) => (
            <p key={pi} className="mb-2 leading-relaxed text-slate-800">
              {p}
            </p>
          ))}
        </div>
      ))}

      {/* ===== Live counter (screen only) ===== */}
      {!readOnly && (
        <div
          dir="rtl"
          className="mt-5 flex items-center gap-3 bg-gradient-to-l from-[#eaf2fb] to-[#e7f6f1] border-2 border-[#0a6ebd] rounded-lg p-3"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          <div className="w-14 h-14 rounded-xl bg-[#0a6ebd] text-white flex flex-col items-center justify-center shrink-0">
            <span className="text-2xl font-black leading-none">{marks}</span>
            <span className="text-[9px] opacity-80">MARKS</span>
          </div>
          <div>
            <div className="text-xs text-slate-600 font-semibold">عدد المعايير المحققة</div>
            <div className="font-bold text-[#084e87]">
              {marks} من {schema.rows.length} معيار
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
