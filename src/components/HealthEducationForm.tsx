"use client";
import {
  HealthEducationSchema,
  HealthEducationSection,
} from "@/lib/formSchemas";

type FollowupRow = {
  description: string;
  explainedBy: string;
  done: boolean;
  signature: string;
};

function TextInput({
  value,
  onChange,
  className = "",
  placeholder = "",
  readOnly = false,
}: {
  value: any;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  if (readOnly) {
    return <span className={`education-value ${className}`}>{value || ""}</span>;
  }
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`education-input ${className}`}
    />
  );
}

function SquareChoice({
  checked,
  label,
  onClick,
  readOnly = false,
}: {
  checked?: boolean;
  label: string;
  onClick?: () => void;
  readOnly?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !readOnly && onClick?.()}
      className={`education-choice ${checked ? "checked" : ""} ${readOnly ? "readonly" : ""}`}
    >
      <span>{label}</span>
      <i>{checked ? "✓" : ""}</i>
    </button>
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
    <div className="education-header">
      <div>
        إسم المريض رباعى :
        <TextInput
          value={patient?.name}
          onChange={(v) => onPatientChange?.("name", v)}
          readOnly={readOnly}
          className="education-header-line"
        />
      </div>
      <div>
        الرقم الطبى الموحد :
        <TextInput
          value={patient?.patientId}
          onChange={(v) => onPatientChange?.("patientId", v)}
          readOnly={readOnly}
          className="education-header-line"
        />
      </div>
    </div>
  );
}

function PaperFooter({
  page,
}: {
  schema: HealthEducationSchema;
  page: 1 | 2;
  hideMeta?: boolean;
}) {
  return (
    <div className="education-footer education-footer-page-only" dir="ltr">
      <b>Page {page} of 2</b>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <tr className="education-section-row">
      <td colSpan={3}>{title}</td>
    </tr>
  );
}

function EducationRow({
  rowKey,
  label,
  data,
  set,
  readOnly,
}: {
  rowKey: string;
  label: string;
  data: Record<string, any>;
  set: (key: string, value: any) => void;
  readOnly?: boolean;
}) {
  return (
    <tr>
      <td className="education-label-cell">{label}</td>
      <td className="education-done-cell">
        <button
          type="button"
          onClick={() => !readOnly && set(`${rowKey}Done`, !data[`${rowKey}Done`])}
          className={`education-table-check ${data[`${rowKey}Done`] ? "checked" : ""}`}
        >
          {data[`${rowKey}Done`] ? "✓" : ""}
        </button>
      </td>
      <td>
        <TextInput
          value={data[`${rowKey}Signature`] || ""}
          onChange={(v) => set(`${rowKey}Signature`, v)}
          readOnly={readOnly}
          className="education-table-input"
        />
      </td>
    </tr>
  );
}

export function HealthEducationForm({
  schema,
  data,
  patient,
  onChange,
  onPatientChange,
  readOnly = false,
  compact = false,
}: {
  schema: HealthEducationSchema;
  data: Record<string, any>;
  patient?: any;
  onChange?: (key: string, value: any) => void;
  onPatientChange?: (field: string, value: string) => void;
  readOnly?: boolean;
  compact?: boolean;
}) {
  const set = (key: string, value: any) => {
    if (!readOnly) onChange?.(key, value);
  };
  const get = (key: string) => data[key] || "";
  const barriers: string[] = Array.isArray(data.barriers) ? data.barriers : [];
  const savedFollowupRows: FollowupRow[] = Array.isArray(data.followupRows)
    ? data.followupRows
    : [];
  // The printed back page is limited to exactly seven rows so the signature,
  // date, time and footer always remain inside a single A4 sheet.
  const followupRows: FollowupRow[] = Array.from(
    { length: schema.followupRows },
    (_, index) =>
      savedFollowupRows[index] || {
        description: "",
        explainedBy: "",
        done: false,
        signature: "",
      }
  );

  const toggleArray = (key: string, value: string, values: string[]) => {
    set(
      key,
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value]
    );
  };

  const updateFollowup = (index: number, patch: Partial<FollowupRow>) => {
    set(
      "followupRows",
      followupRows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  return (
    <div className={`education-paper ${compact ? "compact" : ""}`} dir="rtl">
      {/* ================= الصفحة الأولى ================= */}
      <section className="education-page">
        <PaperHeader
          patient={patient}
          onPatientChange={onPatientChange}
          readOnly={readOnly}
        />

        <div className="education-title">{schema.title}</div>

        <div className="education-meta-line">
          <span>القسم :</span>
          <TextInput
            value={get("department") || patient?.department}
            onChange={(v) => set("department", v)}
            readOnly={readOnly}
            className="education-department-line"
          />
          <span>تاريخ الدخول :</span>
          <TextInput
            value={get("admissionDate")}
            onChange={(v) => set("admissionDate", v)}
            readOnly={readOnly}
            placeholder="  /  /  "
            className="education-date-line"
          />
        </div>

        <div className="education-assessment-title">{schema.assessmentTitle}</div>

        <div className="education-assessment">
          <div className="education-assessment-label">التعليم :</div>
          <div className="education-options education-options-four">
            {schema.educationOptions.map((option) => (
              <SquareChoice
                key={option.key}
                label={option.label}
                checked={data.educationLevel === option.key}
                onClick={() =>
                  set(
                    "educationLevel",
                    data.educationLevel === option.key ? "" : option.key
                  )
                }
                readOnly={readOnly}
              />
            ))}
          </div>

          <div className="education-assessment-label">
            الحالة النفسية والقابلية للتعلم:
          </div>
          <div className="education-options education-options-two">
            {schema.readinessOptions.map((option) => (
              <SquareChoice
                key={option.key}
                label={option.label}
                checked={data.readiness === option.key}
                onClick={() =>
                  set(
                    "readiness",
                    data.readiness === option.key ? "" : option.key
                  )
                }
                readOnly={readOnly}
              />
            ))}
          </div>

          <div className="education-assessment-label underline">عوائق التثقيف :</div>
          <div className="education-options education-options-two barriers-row">
            {schema.barrierOptions.map((option) => (
              <SquareChoice
                key={option.key}
                label={option.label}
                checked={barriers.includes(option.key)}
                onClick={() => toggleArray("barriers", option.key, barriers)}
                readOnly={readOnly}
              />
            ))}
          </div>

          <div className="education-inline-options">
            <span>بناءً على المعلومات السابقة سيتم تقديم التثقيف لـ</span>
            {schema.recipientOptions.map((option) => (
              <SquareChoice
                key={option.key}
                label={option.label}
                checked={data.recipient === option.key}
                onClick={() =>
                  set(
                    "recipient",
                    data.recipient === option.key ? "" : option.key
                  )
                }
                readOnly={readOnly}
              />
            ))}
          </div>

          <div className="education-method-line">
            <span>طريقة التثقيف :</span>
            {schema.methodOptions.slice(0, 2).map((option) => (
              <SquareChoice
                key={option.key}
                label={option.label}
                checked={data.method === option.key}
                onClick={() =>
                  set("method", data.method === option.key ? "" : option.key)
                }
                readOnly={readOnly}
              />
            ))}
          </div>
          <div className="education-method-other">
            <SquareChoice
              label={schema.methodOptions[2].label}
              checked={data.method === "other"}
              onClick={() =>
                set("method", data.method === "other" ? "" : "other")
              }
              readOnly={readOnly}
            />
            <TextInput
              value={get("methodOther")}
              onChange={(v) => set("methodOther", v)}
              readOnly={readOnly}
              className="education-other-line"
            />
          </div>
        </div>

        <table className="education-main-table">
          <thead>
            <tr>
              <th>شرح من قبل الفريق الطبى</th>
              <th>تم</th>
              <th>التوقيع</th>
            </tr>
          </thead>
          <tbody>
            {schema.sections.map((section: HealthEducationSection) => (
              <>{/* keyed fragment avoided to keep simple table markup */}
                <SectionHeader title={section.title} />
                {section.rows.map((row) => (
                  <EducationRow
                    key={row.key}
                    rowKey={row.key}
                    label={row.label}
                    data={data}
                    set={set}
                    readOnly={readOnly}
                  />
                ))}
              </>
            ))}
          </tbody>
        </table>

        <PaperFooter schema={schema} page={1} />
      </section>

      {/* ================= الصفحة الثانية ================= */}
      <section className="education-page page-break-before">
        <PaperHeader
          patient={patient}
          onPatientChange={onPatientChange}
          readOnly={readOnly}
        />

        <table className="education-followup-table">
          <thead>
            <tr>
              <th>شرح من قبل الفريق الطبى</th>
              <th>شرح من قبل</th>
              <th>تم</th>
              <th>التوقيع</th>
            </tr>
          </thead>
          <tbody>
            {followupRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <textarea
                    value={row.description}
                    onChange={(e) =>
                      updateFollowup(index, { description: e.target.value })
                    }
                    readOnly={readOnly}
                    className="education-followup-textarea"
                  />
                </td>
                <td>
                  <textarea
                    value={row.explainedBy}
                    onChange={(e) =>
                      updateFollowup(index, { explainedBy: e.target.value })
                    }
                    readOnly={readOnly}
                    className="education-followup-textarea"
                  />
                </td>
                <td className="education-followup-check-cell">
                  <button
                    type="button"
                    onClick={() =>
                      !readOnly &&
                      updateFollowup(index, { done: !row.done })
                    }
                    className={`education-table-check ${row.done ? "checked" : ""}`}
                  >
                    {row.done ? "✓" : ""}
                  </button>
                </td>
                <td>
                  <textarea
                    value={row.signature}
                    onChange={(e) =>
                      updateFollowup(index, { signature: e.target.value })
                    }
                    readOnly={readOnly}
                    className="education-followup-textarea"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="education-bottom-signature">
          <div className="education-signature-group patient-signature-group">
            <span>توقيع المريض أو ذويه :</span>
            <TextInput
              value={get("patientSignature")}
              onChange={(v) => set("patientSignature", v)}
              readOnly={readOnly}
              className="education-bottom-sign-line"
            />
          </div>
          <div className="education-signature-group date-signature-group">
            <span>التاريخ :</span>
            <TextInput
              value={get("signatureDate")}
              onChange={(v) => set("signatureDate", v)}
              readOnly={readOnly}
              placeholder="  /  /  "
              className="education-bottom-date-line"
            />
          </div>
          <div className="education-signature-group time-signature-group">
            <span>الساعة :</span>
            <TextInput
              value={get("signatureTime")}
              onChange={(v) => set("signatureTime", v)}
              readOnly={readOnly}
              className="education-bottom-time-line"
            />
          </div>
        </div>

        <PaperFooter schema={schema} page={2} hideMeta />
      </section>
    </div>
  );
}
