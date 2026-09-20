"use client";
import {
  PaduaSchema,
  PaduaPxRow,
  computePaduaScore,
  emptyPaduaRows,
} from "@/lib/formSchemas";

function FormFooter({
  page,
  compact,
}: {
  schema: PaduaSchema;
  page: 1 | 2;
  compact?: boolean;
}) {
  return (
    <div
      className="padua-footer-page-only"
      style={{ fontSize: compact ? 8 : 11, fontFamily: "Times New Roman, serif" }}
    >
      Page {page} of 2
    </div>
  );
}

function PatientHeader({
  schema,
  patient,
  onPatientChange,
  readOnly,
  compact,
}: {
  schema: PaduaSchema;
  patient?: { name?: string; patientId?: string; department?: string } | null;
  onPatientChange?: (field: "name" | "patientId" | "department", value: string) => void;
  readOnly?: boolean;
  compact?: boolean;
}) {
  const val = (k: "name" | "patientId" | "department") => {
    if (k === "name") return patient?.name || "";
    if (k === "patientId") return patient?.patientId || "";
    return patient?.department || "";
  };
  return (
    <div dir="rtl" className="mb-4 space-y-1.5" style={{ fontSize: compact ? 10 : 13 }}>
      {schema.patientLines.map((l) => (
        <div key={l.value} className="flex items-baseline gap-2">
          <span className="whitespace-nowrap font-semibold">{l.label}</span>
          {readOnly ? (
            <span className="flex-1 border-b border-dotted border-black min-h-[1.1em] font-bold px-1">
              {val(l.value) || <span className="text-slate-300 tracking-widest">……………………</span>}
            </span>
          ) : (
            <input
              value={val(l.value)}
              onChange={(e) => onPatientChange?.(l.value, e.target.value)}
              placeholder="اضغط واكتب هنا..."
              className="flex-1 border-b border-dotted border-black min-h-[1.1em] font-bold px-1 outline-none focus:border-[#0a6ebd] bg-transparent"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function PaduaForm({
  schema,
  data,
  patient,
  doctorName,
  signedAt,
  onChange,
  onPatientChange,
  onDoctorChange,
  readOnly = false,
  compact = false,
}: {
  schema: PaduaSchema;
  data: Record<string, any>;
  patient?: { name?: string; patientId?: string; department?: string } | null;
  doctorName?: string;
  signedAt?: string | Date | null;
  onChange?: (key: string, value: any) => void;
  onPatientChange?: (field: "name" | "patientId" | "department", value: string) => void;
  onDoctorChange?: (name: string) => void;
  readOnly?: boolean;
  compact?: boolean;
}) {
  const score = computePaduaScore(schema, data);
  const rows: PaduaPxRow[] =
    Array.isArray(data.pxRows) && data.pxRows.length
      ? data.pxRows
      : emptyPaduaRows(schema.pxRowCount);

  const set = (k: string, v: any) => {
    if (readOnly || !onChange) return;
    onChange(k, v);
  };

  const toggle = (key: string) => set(key, data[key] ? "" : true);

  const updateRow = (i: number, patch: Partial<PaduaPxRow>) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    set("pxRows", next);
  };

  const fs = compact ? "text-[9px]" : "text-[13px]";
  const pad = compact ? "px-1.5 py-1" : "px-2 py-1.5";
  const when = signedAt ? new Date(signedAt) : new Date();
  const dateStr = when.toLocaleDateString("en-GB");
  const timeStr = when.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      dir="ltr"
      className="w-full bg-white text-black"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* ===================== PAGE 1 ===================== */}
      <section className="padua-page">
        <PatientHeader
          schema={schema}
          patient={patient}
          onPatientChange={onPatientChange}
          readOnly={readOnly}
          compact={compact}
        />

        <h2
          className="text-center font-bold mb-4 leading-snug"
          style={{ fontSize: compact ? 13 : 18 }}
        >
          {schema.headerTitle}
        </h2>

        <table className={`w-full border-collapse ${fs}`} style={{ border: "1px solid #000" }}>
          <thead>
            <tr>
              <th className={`border border-black ${pad} font-bold text-center`}>
                Baseline features
              </th>
              <th className={`border border-black ${pad} font-bold text-center`} style={{ width: compact ? 70 : 90 }}>
                Score
              </th>
              <th className={`border border-black ${pad}`} style={{ width: compact ? 50 : 70 }}></th>
            </tr>
          </thead>
          <tbody>
            {schema.factors.map((f) => {
              const on = !!data[f.key];
              return (
                <tr
                  key={f.key}
                  onClick={() => toggle(f.key)}
                  className={
                    readOnly
                      ? ""
                      : `cursor-pointer ${on ? "bg-[#dcefe6]" : "hover:bg-[#eef5fc]"}`
                  }
                >
                  <td className={`border border-black ${pad} text-left`}>
                    {f.superscript && <sup>{f.superscript}</sup>}
                    {f.label}
                  </td>
                  <td className={`border border-black ${pad} text-center`}>
                    {f.points} {f.points === 1 ? "point" : "points"}
                  </td>
                  <td className={`border border-black ${pad} text-center align-middle`}>
                    {on ? (
                      <span className="font-bold" style={{ fontSize: compact ? 12 : 16 }}>
                        ✓
                      </span>
                    ) : (
                      <span className="text-slate-300 select-none">{readOnly ? "" : "✓"}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={3} className={`border border-black ${pad} text-[0.92em] leading-snug`}>
                {schema.footnotes.map((fn, i) => (
                  <div key={i} className="mb-0.5">
                    {fn}
                  </div>
                ))}
              </td>
            </tr>
            <tr>
              <td
                colSpan={2}
                className={`border border-black ${pad} font-bold text-center`}
                style={{ fontSize: compact ? 11 : 15 }}
              >
                {schema.totalLabel}
              </td>
              <td className={`border border-black ${pad} text-center font-black`} style={{ fontSize: compact ? 13 : 18 }}>
                {score.total}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className={`border border-black ${compact ? "px-2 py-2" : "px-3 py-3"}`}>
                <ul className="list-disc ml-5 space-y-1">
                  <li className={!score.high ? "font-bold" : ""}>
                    {schema.lowLabel}
                    {!score.high && <span className="ml-2">←</span>}
                  </li>
                  <li className={score.high ? "font-bold" : ""}>
                    {schema.highLabel}
                    {score.high && <span className="ml-2">←</span>}
                  </li>
                </ul>
              </td>
            </tr>
            <tr>
              <td className={`border border-black ${pad}`}>
                <span className="font-bold">Physician :</span>{" "}
                {readOnly ? (
                  <span className="font-semibold">{doctorName || "………………"}</span>
                ) : (
                  <input
                    value={doctorName || ""}
                    onChange={(e) => onDoctorChange?.(e.target.value)}
                    placeholder="Physician Name..."
                    className="font-semibold bg-transparent outline-none border-b border-transparent focus:border-[#0a6ebd] px-1"
                  />
                )}
              </td>
              <td colSpan={2} className={`border border-black ${pad}`}>
                <span className="font-bold">Date :</span> {dateStr}
                <span className="inline-block w-6" />
                <span className="font-bold">Time :</span> {timeStr}
              </td>
            </tr>
          </tbody>
        </table>

        <FormFooter schema={schema} page={1} compact={compact} />
      </section>

      {/* ===================== PAGE 2 ===================== */}
      <section className="padua-page mt-10 pt-6 border-t border-dashed border-slate-300 print:border-0 print:mt-0 print:pt-0">
        <PatientHeader
          schema={schema}
          patient={patient}
          onPatientChange={onPatientChange}
          readOnly={readOnly}
          compact={compact}
        />

        <h2
          className="text-center font-bold underline mb-4"
          style={{ fontSize: compact ? 13 : 17 }}
        >
          {schema.recTitle}
        </h2>

        <table className={`w-full border-collapse mb-5 ${fs}`} style={{ border: "1px solid #000" }}>
          <tbody>
            {schema.recRows.map((r, i) => {
              const active =
                (i === 0 && !score.high) || (i === 1 && score.high);
              return (
                <tr key={i} className={active ? "bg-[#dcefe6]" : ""}>
                  <td
                    className={`border border-black ${pad} font-bold align-middle`}
                    style={{ width: "38%" }}
                  >
                    {r.condition}
                  </td>
                  <td className={`border border-black ${pad} align-middle whitespace-pre-line`}>
                    {r.recommendation.split("NOT").map((chunk, ci, arr) =>
                      ci === 0 && arr.length > 1 ? (
                        <span key={ci}>
                          {chunk}
                          <span className="underline font-bold">NOT</span>
                        </span>
                      ) : (
                        <span key={ci}>{chunk}</span>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <table className={`w-full border-collapse ${fs}`} style={{ border: "1px solid #000" }}>
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="border border-black px-1 py-1 font-semibold text-center align-middle"
                style={{ width: "12%" }}
              >
                Date
                <br />&amp; Time
              </th>
              <th
                rowSpan={2}
                className="border border-black px-1 py-1 font-semibold text-center align-middle"
                style={{ width: "11%" }}
              >
                Reassess
                <br />
                Score
              </th>
              <th
                colSpan={3}
                className="border border-black px-1 py-1 font-semibold text-center"
              >
                Physician decision
              </th>
              <th
                rowSpan={2}
                className="border border-black px-1 py-1 font-semibold text-center align-middle"
                style={{ width: "12%" }}
              >
                drug
              </th>
              <th
                rowSpan={2}
                className="border border-black px-1 py-1 font-semibold text-center align-middle"
                style={{ width: "10%" }}
              >
                Phys.
                <br />
                .Sign
              </th>
              <th
                rowSpan={2}
                className="border border-black px-1 py-1 font-semibold text-center align-middle"
                style={{ width: "10%" }}
              >
                Clinical
                <br />
                Ph.
                <br />
                Sign
              </th>
            </tr>
            <tr>
              <th className="border border-black px-1 py-1 font-semibold text-center" style={{ width: "13%" }}>
                No VTE
                <br />
                Prophylaxis
              </th>
              <th className="border border-black px-1 py-1 font-semibold text-center" style={{ width: "16%" }}>
                Non pharmacological
                <br />
                prophylaxis(mechanical)
              </th>
              <th className="border border-black px-1 py-1 font-semibold text-center" style={{ width: "14%" }}>
                Pharmacological
                <br />
                prophylaxis
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <PxCell
                  value={row.datetime}
                  readOnly={readOnly}
                  compact={compact}
                  placeholder="date / time"
                  onChange={(v) => updateRow(i, { datetime: v })}
                />
                <PxCell
                  value={row.reassess}
                  readOnly={readOnly}
                  compact={compact}
                  placeholder="score"
                  onChange={(v) => updateRow(i, { reassess: v })}
                />
                <PxCheck
                  on={row.decision === "none"}
                  readOnly={readOnly}
                  compact={compact}
                  onToggle={() =>
                    updateRow(i, { decision: row.decision === "none" ? "" : "none" })
                  }
                />
                <PxCheck
                  on={row.decision === "mechanical"}
                  readOnly={readOnly}
                  compact={compact}
                  onToggle={() =>
                    updateRow(i, {
                      decision: row.decision === "mechanical" ? "" : "mechanical",
                    })
                  }
                />
                <PxCheck
                  on={row.decision === "pharmacological"}
                  readOnly={readOnly}
                  compact={compact}
                  onToggle={() =>
                    updateRow(i, {
                      decision: row.decision === "pharmacological" ? "" : "pharmacological",
                    })
                  }
                />
                <PxCell
                  value={row.drug}
                  readOnly={readOnly}
                  compact={compact}
                  placeholder="drug"
                  onChange={(v) => updateRow(i, { drug: v })}
                />
                <PxCell
                  value={row.physSign}
                  readOnly={readOnly}
                  compact={compact}
                  placeholder="sign"
                  onChange={(v) => updateRow(i, { physSign: v })}
                />
                <PxCell
                  value={row.clinicalSign}
                  readOnly={readOnly}
                  compact={compact}
                  placeholder="sign"
                  onChange={(v) => updateRow(i, { clinicalSign: v })}
                />
              </tr>
            ))}
          </tbody>
        </table>

        <FormFooter schema={schema} page={2} compact={compact} />
      </section>

      {!readOnly && (
        <div
          dir="rtl"
          className="mt-5 flex items-center gap-3 bg-gradient-to-l from-[#eaf2fb] to-[#e7f6f1] border-2 border-[#0a6ebd] rounded-lg p-3"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          <div className="w-16 h-16 rounded-xl bg-[#0a6ebd] text-white flex flex-col items-center justify-center shrink-0">
            <span className="text-2xl font-black leading-none">{score.total}</span>
            <span className="text-[9px] opacity-80">PADUA</span>
          </div>
          <div>
            <div className="text-xs text-slate-600 font-semibold">النتيجة التلقائية</div>
            <div className="font-bold text-[#084e87]">{score.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              اضغط على أي بند في الجدول لوضع ✓ — اضغط الخانات الفارغة في صفحة الوقاية للكتابة.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PxCell({
  value,
  onChange,
  readOnly,
  compact,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  readOnly: boolean;
  compact?: boolean;
  placeholder?: string;
}) {
  if (readOnly) {
    return (
      <td className="border border-black px-1 py-1 text-center align-middle h-7">
        {value}
      </td>
    );
  }
  return (
    <td className="border border-black p-0 align-middle">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-full bg-transparent text-center outline-none focus:bg-blue-50 px-1 py-1"
        style={{ fontSize: compact ? 8 : 11, minHeight: compact ? 22 : 28 }}
      />
    </td>
  );
}

function PxCheck({
  on,
  onToggle,
  readOnly,
  compact,
}: {
  on: boolean;
  onToggle: () => void;
  readOnly: boolean;
  compact?: boolean;
}) {
  return (
    <td
      onClick={() => !readOnly && onToggle()}
      className={`border border-black text-center align-middle ${
        readOnly ? "" : "cursor-pointer hover:bg-blue-50"
      } ${on ? "bg-[#dcefe6]" : ""}`}
      style={{ minHeight: compact ? 22 : 28 }}
    >
      {on ? (
        <span className="font-bold" style={{ fontSize: compact ? 12 : 16 }}>
          ✓
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </td>
  );
}
