"use client";
import {
  ScoreGridSchema,
  LevelGridSchema,
  GCS_VALUES,
  gcsPoints,
  computeGridScore,
} from "@/lib/formSchemas";

/* =================== APACHE-style score grid =================== */
export function ScoreGrid({
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
  schema: ScoreGridSchema;
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
  const breakdown = computeGridScore(schema, data);
  const missingSet = new Set(breakdown.missing);

  const fs = compact ? "text-[8px]" : "text-[11px]";
  const pad = compact ? "px-0.5 py-0.5" : "px-1.5 py-1.5";

  const set = (k: string, v: any) => {
    if (readOnly || !onChange) return;
    onChange(k, v);
  };

  return (
    <div dir="ltr" className="w-full">
      {/* Patient info bar */}
      <div
        dir="rtl"
        className="mb-2 p-2 bg-slate-50 border border-slate-300 rounded flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{ fontFamily: "Cairo, sans-serif" }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="font-bold text-slate-700">اسم المريض:</span>
          {readOnly ? (
            <span className="font-bold text-slate-900">{patient?.name || "………………"}</span>
          ) : (
            <input
              value={patient?.name || ""}
              onChange={(e) => onPatientChange?.("name", e.target.value)}
              placeholder="اضغط واكتب اسم المريض..."
              className="flex-1 bg-transparent border-b border-dotted border-slate-400 font-bold outline-none focus:border-[#0a6ebd]"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">الرقم الطبي:</span>
          {readOnly ? (
            <span className="font-bold font-mono text-slate-900">{patient?.patientId || "………………"}</span>
          ) : (
            <input
              value={patient?.patientId || ""}
              onChange={(e) => onPatientChange?.("patientId", e.target.value)}
              placeholder="الرقم الطبي..."
              className="bg-transparent border-b border-dotted border-slate-400 font-bold font-mono outline-none focus:border-[#0a6ebd] w-28"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">الطبيب:</span>
          {readOnly ? (
            <span className="font-semibold text-slate-900">{doctorName || "………………"}</span>
          ) : (
            <input
              value={doctorName || ""}
              onChange={(e) => onDoctorChange?.(e.target.value)}
              placeholder="اسم الطبيب..."
              className="bg-transparent border-b border-dotted border-slate-400 font-semibold outline-none focus:border-[#0a6ebd] w-36"
            />
          )}
        </div>
      </div>

      {/* Title bar */}
      <div className="bg-[#5b9bd5] text-white text-center font-black py-2 rounded-t-md border border-[#2e75b6]"
           style={{ fontSize: compact ? 13 : 20 }}>
        {schema.headerTitle}
      </div>

      <div className="overflow-x-auto border-x border-b border-slate-400 rounded-b-md bg-white">
        <table className={`w-full border-collapse ${fs}`} style={{ minWidth: compact ? undefined : 860 }}>
          {/* Group header */}
          <thead>
            <tr>
              {schema.groupHeaders.map((g, i) => (
                <th
                  key={i}
                  colSpan={g.span}
                  className="bg-[#2e5496] text-white font-bold border border-white/40 px-2 py-1.5 text-center"
                >
                  {g.label}
                </th>
              ))}
            </tr>
            <tr>
              <th className="bg-[#2e5496] border border-white/40"></th>
              {schema.columns.map((c, i) => (
                <th
                  key={i}
                  className={`border border-slate-300 font-bold text-center px-1 py-1 ${
                    i === 4 ? "bg-slate-200 text-slate-900" : "bg-slate-100 text-slate-800"
                  }`}
                  style={{ width: `${72 / schema.columns.length}%` }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {schema.rows.map((row, ri) => {
              const isMissing = showErrors && missingSet.has(row.label);
              const zebra = ri % 2 === 0 ? "bg-white" : "bg-[#f2f2f7]";

              /* --- GCS special row --- */
              if (row.type === "gcs") {
                const v = data[row.key];
                return (
                  <tr key={row.key} className={zebra}>
                    <td
                      className={`border border-slate-300 ${pad} font-bold text-[#c00000] align-middle ${
                        isMissing ? "bg-red-50" : ""
                      }`}
                    >
                      {row.label}
                      {isMissing && <span className="text-red-600"> *</span>}
                    </td>
                    <td colSpan={schema.columns.length} className={`border border-slate-300 ${pad}`}>
                      <div className="flex flex-wrap items-center gap-1">
                        {!readOnly && (
                          <span className="text-slate-500 font-semibold ml-1 mr-1">
                            Glasgow Coma Scale:
                          </span>
                        )}
                        {GCS_VALUES.map((g) => {
                          const sel = String(v) === String(g);
                          if (readOnly && !sel) return null;
                          return (
                            <button
                              key={g}
                              type="button"
                              disabled={readOnly}
                              onClick={() => set(row.key, sel ? "" : g)}
                              className={`px-1.5 py-0.5 rounded border font-bold transition ${
                                sel
                                  ? "bg-[#2e5496] text-white border-[#2e5496]"
                                  : "bg-white border-slate-300 text-slate-700 hover:bg-blue-50 hover:border-[#2e5496]"
                              }`}
                              title={`GCS ${g} → ${gcsPoints(g)} points`}
                            >
                              {g}
                              <span className={sel ? "opacity-80" : "text-slate-400"}>
                                →{gcsPoints(g)}
                              </span>
                            </button>
                          );
                        })}
                        {readOnly && (v === undefined || v === "") && (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }

              /* --- normal cell row --- */
              const selectedIdx = data[row.key];
              return (
                <tr key={row.key} className={zebra}>
                  <td
                    className={`border border-slate-300 ${pad} font-bold text-[#c00000] align-middle ${
                      isMissing ? "bg-red-50" : ""
                    }`}
                  >
                    <div>{row.label}{isMissing && <span className="text-red-600"> *</span>}</div>
                    {row.sublabel && (
                      <div className="text-slate-600 font-normal whitespace-pre-line" style={{ fontSize: compact ? 7 : 9 }}>
                        {row.sublabel}
                      </div>
                    )}
                  </td>
                  {row.cells.map((cell, ci) => {
                    if (!cell) {
                      return <td key={ci} className="border border-slate-300 bg-[#dcdce6]"></td>;
                    }
                    const sel = String(selectedIdx) === String(ci);
                    return (
                      <td
                        key={ci}
                        onClick={() => set(row.key, sel ? "" : ci)}
                        className={`border text-center whitespace-pre-line align-middle transition ${pad} ${
                          sel
                            ? "bg-[#2e5496] text-white font-black border-[#1f3864]"
                            : readOnly
                            ? "border-slate-300 text-slate-800"
                            : "border-slate-300 text-slate-800 cursor-pointer hover:bg-[#cfe2f3] hover:ring-1 hover:ring-[#2e5496]"
                        }`}
                      >
                        {cell.text}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend boxes (Age-score) */}
      {schema.extras && schema.extras.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {schema.extras.map((ex) => {
            const sel = data[ex.key];
            const isMissing = showErrors && missingSet.has(ex.title);
            return (
              <div
                key={ex.key}
                className={`border-2 rounded ${isMissing ? "border-red-400" : "border-slate-800"}`}
                style={{ minWidth: compact ? 130 : 180 }}
              >
                <div className="bg-slate-900 text-white font-bold px-3 py-1 text-center" style={{ fontSize: compact ? 9 : 12 }}>
                  {ex.title}
                  {isMissing && <span className="text-red-300"> *</span>}
                </div>
                <div className="p-1.5 bg-[#f2f2f7]">
                  {ex.options.map((o, oi) => {
                    const s = String(sel) === String(oi);
                    if (readOnly && !s) return null;
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={readOnly}
                        onClick={() => set(ex.key, s ? "" : oi)}
                        className={`block w-full text-left px-2 py-0.5 rounded font-mono font-bold transition ${
                          s
                            ? "bg-[#2e5496] text-white"
                            : "text-slate-800 hover:bg-[#cfe2f3]"
                        }`}
                        style={{ fontSize: compact ? 9 : 12 }}
                      >
                        {o.text}
                      </button>
                    );
                  })}
                  {readOnly && (sel === undefined || sel === "") && (
                    <div className="text-slate-400 px-2 text-center">—</div>
                  )}
                </div>
              </div>
            );
          })}

          {/* GCS conversion legend (reference, as printed) */}
          <div className="border-2 border-slate-800 rounded flex-1" style={{ minWidth: compact ? 200 : 300 }}>
            <div className="bg-slate-900 text-white font-bold px-3 py-1" style={{ fontSize: compact ? 9 : 12 }}>
              GCS:
            </div>
            <div className="p-1.5 bg-[#f2f2f7] grid grid-cols-3 gap-x-2 font-mono" style={{ fontSize: compact ? 8 : 11 }}>
              {GCS_VALUES.map((g) => (
                <div key={g} className={String(data["gcs"]) === String(g) ? "font-black text-[#2e5496]" : "text-slate-700"}>
                  {g} → {gcsPoints(g)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footnote + source */}
      <div className="flex flex-wrap justify-between items-end gap-2 mt-2">
        {schema.footnote && (
          <div className="text-slate-500" style={{ fontSize: compact ? 7 : 10 }}>
            {schema.footnote}
          </div>
        )}
        {schema.source && (
          <div className="text-slate-600 font-semibold italic" style={{ fontSize: compact ? 8 : 11 }}>
            {schema.source}
          </div>
        )}
      </div>

      {/* Total */}
      <div dir="rtl" className="mt-3 flex flex-wrap items-center gap-3 bg-gradient-to-l from-[#eaf2fb] to-[#e7f6f1] border-2 border-[#2e5496] rounded-lg p-3">
        <div className="w-16 h-16 rounded-xl bg-[#2e5496] text-white flex flex-col items-center justify-center shrink-0">
          <span className="text-2xl font-black leading-none">{breakdown.total}</span>
          <span className="text-[9px] opacity-80">TOTAL</span>
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="text-xs text-slate-600 font-semibold">APACHE II Score</div>
          <div className="font-bold text-[#1f3864]">{breakdown.label || "—"}</div>
          {!readOnly && breakdown.missing.length > 0 && (
            <div className="text-xs text-red-600 mt-1">
              متبقي {breakdown.missing.length} متغير: {breakdown.missing.slice(0, 4).join("، ")}
              {breakdown.missing.length > 4 && "..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =================== PPS-style level grid =================== */
export function LevelGrid({
  schema,
  data,
  onChange,
  readOnly = false,
  showErrors = false,
  compact = false,
}: {
  schema: LevelGridSchema;
  data: Record<string, any>;
  onChange?: (key: string, value: any) => void;
  readOnly?: boolean;
  showErrors?: boolean;
  compact?: boolean;
}) {
  const selected = data[schema.key];
  const fs = compact ? "text-[8px]" : "text-[11px]";
  const pad = compact ? "px-1 py-0.5" : "px-2 py-1.5";

  return (
    <div dir="ltr" className="w-full">
      <div className="text-center font-black text-[#1f3864] mb-2" style={{ fontSize: compact ? 12 : 18 }}>
        {schema.headerTitle}
      </div>
      <div className="overflow-x-auto border border-slate-500 rounded bg-white">
        <table className={`w-full border-collapse ${fs}`} style={{ minWidth: compact ? undefined : 760 }}>
          <thead>
            <tr>
              {schema.columns.map((c, i) => (
                <th key={i} className={`border border-slate-500 bg-slate-100 font-bold text-center ${pad}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schema.rows.map((row) => {
              const sel = selected === row.value;
              if (readOnly && selected && !sel) return null;
              return (
                <tr
                  key={row.value}
                  onClick={() => !readOnly && onChange?.(schema.key, sel ? "" : row.value)}
                  className={`transition ${
                    sel
                      ? "bg-[#2e5496] text-white font-bold"
                      : readOnly
                      ? ""
                      : "cursor-pointer hover:bg-[#cfe2f3]"
                  }`}
                >
                  {row.cells.map((c, ci) => (
                    <td
                      key={ci}
                      className={`border border-slate-500 text-center whitespace-pre-line align-middle ${pad} ${
                        ci === 0 ? "font-bold" : ""
                      }`}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {schema.footnote && (
        <div className="text-slate-500 mt-1" style={{ fontSize: compact ? 7 : 10 }}>
          {schema.footnote}
        </div>
      )}
      {showErrors && !selected && (
        <div className="text-red-600 text-xs mt-2 font-semibold">⚠ يجب اختيار مستوى PPS</div>
      )}
      {selected && (
        <div dir="rtl" className="mt-3 flex items-center gap-3 bg-[#eaf2fb] border-2 border-[#2e5496] rounded-lg p-3">
          <div className="w-16 h-16 rounded-xl bg-[#2e5496] text-white flex items-center justify-center text-xl font-black shrink-0">
            {selected}
          </div>
          <div>
            <div className="text-xs text-slate-600 font-semibold">المستوى المختار</div>
            <div className="font-bold text-[#1f3864]">PPS {selected}</div>
          </div>
        </div>
      )}
    </div>
  );
}
