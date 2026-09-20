"use client";
import { HistoryExamSchema } from "@/lib/formSchemas";

const emptyMedication = () => ({ drug: "", strength: "", dosage: "", dc: false, duration: "" });

function LineInput({
  value,
  onChange,
  placeholder = "",
  className = "",
  readOnly = false,
}: {
  value: any;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}) {
  if (readOnly) return <span className={`paper-value ${className}`}>{value || ""}</span>;
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`paper-input ${className}`}
    />
  );
}

function PaperHeader({
  patient,
  onPatientChange,
  readOnly,
}: {
  patient?: any;
  onPatientChange?: (field: string, value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="history-header" dir="rtl">
      <div>
        اسم المريض رباعي : <LineInput value={patient?.name} onChange={(v) => onPatientChange?.("name", v)} readOnly={readOnly} />
      </div>
      <div>
        الرقم الطبي الموحد : <LineInput value={patient?.patientId} onChange={(v) => onPatientChange?.("patientId", v)} readOnly={readOnly} />
      </div>
    </div>
  );
}

function PaperFooter({ page }: { schema: HistoryExamSchema; page: 1 | 2 }) {
  return (
    <div className="history-footer history-footer-page-only" dir="ltr">
      <b>Page {page} of 2</b>
    </div>
  );
}

function Choice({
  selected,
  onClick,
  label,
  readOnly,
}: {
  selected?: boolean;
  onClick?: () => void;
  label?: string;
  readOnly?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !readOnly && onClick?.()}
      className={`paper-choice ${selected ? "selected" : ""} ${readOnly ? "readonly" : ""}`}
    >
      <span className="choice-circle">{selected ? "✓" : "1"}</span>
      {label && <span>{label}</span>}
    </button>
  );
}

function TextLine({
  label,
  value,
  onChange,
  readOnly,
  lines = 1,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  lines?: number;
}) {
  return (
    <div className="history-text-line" style={{ minHeight: lines > 1 ? 25 + lines * 17 : undefined }}>
      <span>{label}</span>
      <LineInput value={value} onChange={onChange} readOnly={readOnly} className="wide-line" />
      {Array.from({ length: Math.max(0, lines - 1) }).map((_, i) => (
        <span className="dot-line" key={i} />
      ))}
    </div>
  );
}

function SystemTable({
  rows,
  data,
  onChange,
  readOnly,
}: {
  rows: HistoryExamSchema["historySystems"];
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  readOnly?: boolean;
}) {
  return (
    <table className="history-table systems-table" dir="ltr">
      <thead>
        <tr>
          <th>History by Systems</th>
          <th>Normal</th>
          <th>Abnormal</th>
          <th>Mention abnormality</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key}>
            <td>{r.label}</td>
            <td className="choice-cell">
              <Choice selected={data[`${r.key}_status`] === "normal"} onClick={() => onChange(`${r.key}_status`, "normal")} readOnly={readOnly} />
            </td>
            <td className="choice-cell">
              <Choice selected={data[`${r.key}_status`] === "abnormal"} onClick={() => onChange(`${r.key}_status`, "abnormal")} readOnly={readOnly} />
            </td>
            <td>
              <LineInput value={data[`${r.key}_note`] || ""} onChange={(v) => onChange(`${r.key}_note`, v)} readOnly={readOnly} className="table-input" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MedicationTable({
  rows,
  data,
  onChange,
  readOnly,
}: {
  rows: number;
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  readOnly?: boolean;
}) {
  const meds = Array.isArray(data.medications) ? data.medications : Array.from({ length: rows }, emptyMedication);
  const update = (i: number, key: string, value: any) => {
    const next = meds.map((m: any, idx: number) => (idx === i ? { ...m, [key]: value } : m));
    onChange("medications", next);
  };
  return (
    <table className="history-table medications-table" dir="ltr">
      <thead>
        <tr><th colSpan={5}>Present medications (before admission)</th></tr>
        <tr><th>Drug</th><th>Strength</th><th>Dosage / frequency</th><th>D/C</th><th>Duration of therapy</th></tr>
      </thead>
      <tbody>
        {meds.map((m: any, i: number) => (
          <tr key={i}>
            <td><LineInput value={m.drug} onChange={(v) => update(i, "drug", v)} readOnly={readOnly} className="table-input" /></td>
            <td><LineInput value={m.strength} onChange={(v) => update(i, "strength", v)} readOnly={readOnly} className="table-input" /></td>
            <td><LineInput value={m.dosage} onChange={(v) => update(i, "dosage", v)} readOnly={readOnly} className="table-input" /></td>
            <td className="choice-cell"><Choice selected={!!m.dc} onClick={() => update(i, "dc", !m.dc)} readOnly={readOnly} /></td>
            <td><LineInput value={m.duration} onChange={(v) => update(i, "duration", v)} readOnly={readOnly} className="table-input" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PhysicalTable({
  rows,
  data,
  onChange,
  readOnly,
}: {
  rows: HistoryExamSchema["physicalSystems"];
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  readOnly?: boolean;
}) {
  return (
    <table className="history-table physical-table" dir="ltr">
      <thead><tr><th></th><th>Normal</th><th>Abnormal</th><th>Mention abnormality</th></tr></thead>
      <tbody>
        {rows.map((r) => r.heading ? (
          <tr key={r.key} className="section-row"><td>{r.label}</td><td></td><td></td><td></td></tr>
        ) : (
          <tr key={r.key}>
            <td>{r.label}</td>
            <td className="choice-cell"><Choice selected={data[`${r.key}_status`] === "normal"} onClick={() => onChange(`${r.key}_status`, "normal")} readOnly={readOnly} /></td>
            <td className="choice-cell"><Choice selected={data[`${r.key}_status`] === "abnormal"} onClick={() => onChange(`${r.key}_status`, "abnormal")} readOnly={readOnly} /></td>
            <td><LineInput value={data[`${r.key}_note`] || ""} onChange={(v) => onChange(`${r.key}_note`, v)} readOnly={readOnly} className="table-input" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function HistoryExamForm({
  schema,
  data,
  patient,
  doctorName,
  onChange,
  onPatientChange,
  onDoctorChange,
  readOnly = false,
  compact = false,
}: {
  schema: HistoryExamSchema;
  data: Record<string, any>;
  patient?: any;
  doctorName?: string;
  onChange?: (key: string, value: any) => void;
  onPatientChange?: (field: string, value: string) => void;
  onDoctorChange?: (name: string) => void;
  readOnly?: boolean;
  compact?: boolean;
}) {
  const set = (key: string, value: any) => {
    if (!readOnly) onChange?.(key, value);
  };
  const get = (key: string) => data[key] || "";
  const sex = get("sex");
  const marital = get("marital");
  const children = get("children");
  const habits = Array.isArray(data.habits) ? data.habits : [];

  return (
    <div className={`history-paper ${compact ? "compact" : ""}`} dir="ltr">
      <section className="history-page">
        <PaperHeader patient={patient} onPatientChange={onPatientChange} readOnly={readOnly} />
        <div className="history-title"><b>التاريخ المرضي</b> PERSONAL HISTORY</div>
        <div className="personal-block">
          <div>Patient name : <LineInput value={patient?.name || get("patientName")} onChange={(v) => onPatientChange?.("name", v)} readOnly={readOnly} /> <span>Mr. no :</span> <LineInput value={patient?.patientId || get("mrNo")} onChange={(v) => onPatientChange?.("patientId", v)} readOnly={readOnly} /></div>
          <div>Age : <LineInput value={get("age")} onChange={(v) => set("age", v)} readOnly={readOnly} className="short-line" /> Sex : <Choice selected={sex === "male"} onClick={() => set("sex", "male")} label="Male" readOnly={readOnly} /> <Choice selected={sex === "female"} onClick={() => set("sex", "female")} label="Female" readOnly={readOnly} /></div>
          <div>Occupation : <LineInput value={get("occupation")} onChange={(v) => set("occupation", v)} readOnly={readOnly} className="medium-line" /></div>
          <div>Marital History : {[["M", "married"], ["S", "single"], ["W", "widowed"], ["D", "divorced"]].map(([label, key]) => <Choice key={key} selected={marital === key} onClick={() => set("marital", key)} label={label} readOnly={readOnly} />)}</div>
          <div>Children: <Choice selected={children === "yes"} onClick={() => set("children", "yes")} label="Yes" readOnly={readOnly} /> <Choice selected={children === "no"} onClick={() => set("children", "no")} label="No" readOnly={readOnly} /> number <LineInput value={get("childrenNumber")} onChange={(v) => set("childrenNumber", v)} readOnly={readOnly} className="short-line" /></div>
          <div>Special Habits : {[["Smoking", "smoking"], ["Coffee", "coffee"], ["Alcohol", "alcohol"]].map(([label, key]) => <Choice key={key} selected={habits.includes(key)} onClick={() => set("habits", habits.includes(key) ? habits.filter((x: string) => x !== key) : [...habits, key])} label={label} readOnly={readOnly} />)}</div>
          <div>Allergy : <Choice selected={get("allergy") === "yes"} onClick={() => set("allergy", "yes")} label="Yes" readOnly={readOnly} /> <Choice selected={get("allergy") === "no"} onClick={() => set("allergy", "no")} label="No" readOnly={readOnly} /> Comment : <LineInput value={get("allergyComment")} onChange={(v) => set("allergyComment", v)} readOnly={readOnly} className="long-line" /></div>
          <div>Adverse drug reaction: <Choice selected={get("adverse") === "yes"} onClick={() => set("adverse", "yes")} label="Yes" readOnly={readOnly} /> <Choice selected={get("adverse") === "no"} onClick={() => set("adverse", "no")} label="No" readOnly={readOnly} /> Comment : <LineInput value={get("adverseComment")} onChange={(v) => set("adverseComment", v)} readOnly={readOnly} className="long-line" /></div>
        </div>

        <TextLine label="Complaints:" value={get("complaints")} onChange={(v) => set("complaints", v)} readOnly={readOnly} lines={2} />
        <TextLine label="Present History:" value={get("presentHistory")} onChange={(v) => set("presentHistory", v)} readOnly={readOnly} lines={6} />
        <TextLine label="Past History (hospital admission &surgery):" value={get("pastHistory")} onChange={(v) => set("pastHistory", v)} readOnly={readOnly} lines={2} />
        <TextLine label="Family History :" value={get("familyHistory")} onChange={(v) => set("familyHistory", v)} readOnly={readOnly} lines={2} />
        <TextLine label="Psychosocial History:" value={get("psychosocialHistory")} onChange={(v) => set("psychosocialHistory", v)} readOnly={readOnly} lines={2} />

        <SystemTable rows={schema.historySystems} data={data} onChange={set} readOnly={readOnly} />
        <MedicationTable rows={schema.medicationRows} data={data} onChange={set} readOnly={readOnly} />
        <PaperFooter schema={schema} page={1} />
      </section>

      <section className="history-page page-break-before">
        <PaperHeader patient={patient} onPatientChange={onPatientChange} readOnly={readOnly} />
        <div className="history-title"><b>الفحص الطبي</b> PHYSICAL EXAMINATION</div>
        <div className="vitals-line">
          B.P: <LineInput value={get("bp")} onChange={(v) => set("bp", v)} readOnly={readOnly} />
          Pulse: <LineInput value={get("pulse")} onChange={(v) => set("pulse", v)} readOnly={readOnly} />
          R.R: <LineInput value={get("rr")} onChange={(v) => set("rr", v)} readOnly={readOnly} />
          Temp.: <LineInput value={get("temp")} onChange={(v) => set("temp", v)} readOnly={readOnly} />
          Weight: <LineInput value={get("weight")} onChange={(v) => set("weight", v)} readOnly={readOnly} />
          Height: <LineInput value={get("height")} onChange={(v) => set("height", v)} readOnly={readOnly} />
        </div>
        <div className="vitals-line">Pain: <Choice selected={get("pain") === "yes"} onClick={() => set("pain", "yes")} label="Yes" readOnly={readOnly} /> <Choice selected={get("pain") === "no"} onClick={() => set("pain", "no")} label="No" readOnly={readOnly} /> <span className="specify">Specify:</span> <LineInput value={get("painSpecify")} onChange={(v) => set("painSpecify", v)} readOnly={readOnly} className="pain-line" /></div>
        <PhysicalTable rows={schema.physicalSystems} data={data} onChange={set} readOnly={readOnly} />
        <TextLine label="Provisional Diagnosis:" value={get("provisionalDiagnosis")} onChange={(v) => set("provisionalDiagnosis", v)} readOnly={readOnly} lines={3} />
        <TextLine label="Associated Risk Factors:" value={get("associatedRiskFactors")} onChange={(v) => set("associatedRiskFactors", v)} readOnly={readOnly} lines={3} />
        <div className="apache-line">APACHE score on admission: <LineInput value={get("apacheScore")} onChange={(v) => set("apacheScore", v)} readOnly={readOnly} className="short-line" /></div>
        <div className="review-line">Checked &amp; Reviewed by Dr. <LineInput value={doctorName} onChange={onDoctorChange} readOnly={readOnly} className="review-input" /></div>
        <div className="review-line">Date : <LineInput value={get("reviewDate")} onChange={(v) => set("reviewDate", v)} readOnly={readOnly} className="short-line" /> Time : <LineInput value={get("reviewTime")} onChange={(v) => set("reviewTime", v)} readOnly={readOnly} className="short-line" /></div>
        <div className="arabic-note">يتم ملئ النموذج عند دخول المريض للمستشفى بحد أقصى 24 ساعة من الدخول في الحالات الطارئة</div>
        <PaperFooter schema={schema} page={2} />
      </section>
    </div>
  );
}
