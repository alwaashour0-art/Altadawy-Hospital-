"use client";
import { useLayoutEffect, useRef } from "react";
import {
  CarePlanRow,
  MultidisciplinaryCareSchema,
} from "@/lib/formSchemas";

const emptyCareRow = (): CarePlanRow => ({
  dateTime: "",
  needs: "",
  interventions: "",
  outcome: "",
  timeFrame: "",
  signature: "",
});

function AutoGrowTextarea({
  value,
  onChange,
  className = "",
  readOnly = false,
  minHeight = 24,
  dir = "auto",
}: {
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  readOnly?: boolean;
  minHeight?: number;
  dir?: "auto" | "rtl" | "ltr";
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.max(minHeight, element.scrollHeight)}px`;
  };

  useLayoutEffect(() => {
    resize();
  }, [value, minHeight]);

  return (
    <textarea
      ref={ref}
      value={value || ""}
      onChange={(event) => {
        onChange?.(event.target.value);
        requestAnimationFrame(resize);
      }}
      onInput={resize}
      readOnly={readOnly}
      dir={dir}
      rows={1}
      className={`care-plan-autogrow ${className}`}
    />
  );
}

function LineInput({
  value,
  onChange,
  className = "",
  placeholder = "",
  readOnly = false,
  multiline = false,
}: {
  value: any;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <AutoGrowTextarea
        value={String(value ?? "")}
        onChange={onChange}
        readOnly={readOnly}
        minHeight={24}
        className={`care-plan-line-textarea ${className}`}
      />
    );
  }
  if (readOnly) {
    return <span className={`care-plan-value ${className}`}>{value || ""}</span>;
  }
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`care-plan-input ${className}`}
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
    <div className="care-plan-patient-header" dir="rtl">
      <div>
        إسم المريض رباعى :
        <LineInput
          value={patient?.name}
          onChange={(value) => onPatientChange?.("name", value)}
          readOnly={readOnly}
          className="care-plan-patient-line"
        />
      </div>
      <div>
        الرقم الطبى الموحد :
        <LineInput
          value={patient?.patientId}
          onChange={(value) => onPatientChange?.("patientId", value)}
          readOnly={readOnly}
          className="care-plan-patient-line"
        />
      </div>
    </div>
  );
}

function PaperFooter({
  page,
}: {
  schema: MultidisciplinaryCareSchema;
  page: 1 | 2;
}) {
  return (
    <div className="care-plan-footer care-plan-footer-page-only" dir="ltr">
      <b>Page {page} of 2</b>
    </div>
  );
}

function CellText({
  value,
  onChange,
  readOnly = false,
  className = "",
}: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <AutoGrowTextarea
      value={value || ""}
      onChange={onChange}
      readOnly={readOnly}
      minHeight={52}
      className={`care-plan-cell-text ${className}`}
    />
  );
}

function CarePlanHeaderRow() {
  return (
    <tr className="care-plan-columns-row">
      <th>Date/Time</th>
      <th>احتياجات المريض/Pt. needs</th>
      <th>الإجراءات العلاجية/ Interventions</th>
      <th>Desired Outcome<br />نتائج المرجوة</th>
      <th>Time Frame<br />الإطار الزمنى</th>
      <th>Physician Sig.</th>
    </tr>
  );
}

function CarePlanRowCells({
  row,
  onChange,
  readOnly = false,
}: {
  row: CarePlanRow;
  onChange: (patch: Partial<CarePlanRow>) => void;
  readOnly?: boolean;
}) {
  return (
    <>
      <td><CellText value={row.dateTime} onChange={(v) => onChange({ dateTime: v })} readOnly={readOnly} /></td>
      <td><CellText value={row.needs} onChange={(v) => onChange({ needs: v })} readOnly={readOnly} /></td>
      <td><CellText value={row.interventions} onChange={(v) => onChange({ interventions: v })} readOnly={readOnly} /></td>
      <td><CellText value={row.outcome} onChange={(v) => onChange({ outcome: v })} readOnly={readOnly} /></td>
      <td><CellText value={row.timeFrame} onChange={(v) => onChange({ timeFrame: v })} readOnly={readOnly} /></td>
      <td><CellText value={row.signature} onChange={(v) => onChange({ signature: v })} readOnly={readOnly} /></td>
    </>
  );
}

function Checkbox({
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
      className={`care-plan-checkbox ${checked ? "checked" : ""}`}
    >
      <i>{checked ? "✓" : ""}</i>
      <span>{label}</span>
    </button>
  );
}

export function MultidisciplinaryCareForm({
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
  schema: MultidisciplinaryCareSchema;
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
  const problems: string[] = Array.from(
    { length: 6 },
    (_, index) => (Array.isArray(data.problems) ? data.problems[index] || "" : "")
  );
  const mainRows: CarePlanRow[] = Array.from(
    { length: schema.mainRows },
    (_, index) =>
      (Array.isArray(data.mainRows) && data.mainRows[index]) || emptyCareRow()
  );
  const involvement: string[] = Array.isArray(data.involvement)
    ? data.involvement
    : [];

  const updateProblem = (index: number, value: string) => {
    set(
      "problems",
      problems.map((problem, i) => (i === index ? value : problem))
    );
  };

  const updateMainRow = (index: number, patch: Partial<CarePlanRow>) => {
    set(
      "mainRows",
      mainRows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const getSectionRow = (key: string): CarePlanRow =>
    data[`${key}Row`] || emptyCareRow();

  const updateSectionRow = (key: string, patch: Partial<CarePlanRow>) => {
    set(`${key}Row`, { ...getSectionRow(key), ...patch });
  };

  const toggleInvolvement = (key: string) => {
    set(
      "involvement",
      involvement.includes(key)
        ? involvement.filter((item) => item !== key)
        : [...involvement, key]
    );
  };

  const responsiblePhysician = data.responsiblePhysician || doctorName || "";
  const updateResponsiblePhysician = (value: string) => {
    set("responsiblePhysician", value);
    onDoctorChange?.(value);
  };

  return (
    <div className={`care-plan-paper ${compact ? "compact" : ""}`} dir="rtl">
      {/* ================= الصفحة الأولى ================= */}
      <section className="care-plan-page">
        <PaperHeader
          patient={patient}
          onPatientChange={onPatientChange}
          readOnly={readOnly}
        />

        <div className="care-plan-title">
          <span>{schema.titleArabic}</span>
          <b>{schema.titleEnglish}</b>
        </div>

        <div className="care-plan-meta-row">
          <div>
            <span>تاريخ الدخول :</span>
            <LineInput
              value={data.admissionDate || ""}
              onChange={(v) => set("admissionDate", v)}
              readOnly={readOnly}
              placeholder="  /  /  "
            />
          </div>
          <div>
            <span>تاريخ الخطة:</span>
            <LineInput
              value={data.planDate || ""}
              onChange={(v) => set("planDate", v)}
              readOnly={readOnly}
              placeholder="  /  /  "
            />
          </div>
          <div>
            <span>القسم :</span>
            <LineInput
              value={data.department || patient?.department || ""}
              onChange={(v) => set("department", v)}
              readOnly={readOnly}
            />
          </div>
        </div>

        <div className="care-plan-diagnosis-row">
          <span>التشخيص:</span>
          <LineInput
            value={data.diagnosis || ""}
            onChange={(v) => set("diagnosis", v)}
            readOnly={readOnly}
            multiline
            className="care-plan-diagnosis-textarea"
          />
        </div>

        <div className="care-plan-gray-title" dir="ltr">
          {schema.physicianPlanTitle}
        </div>

        <table className="care-plan-problems-table" dir="ltr">
          <tbody>
            {[0, 1, 2].map((rowIndex) => (
              <tr key={rowIndex}>
                <th>{rowIndex + 1}.</th>
                <td>
                  <LineInput
                    value={problems[rowIndex]}
                    onChange={(v) => updateProblem(rowIndex, v)}
                    readOnly={readOnly}
                    multiline
                    className="care-plan-problem-input"
                  />
                </td>
                <th>{rowIndex + 4}.</th>
                <td>
                  <LineInput
                    value={problems[rowIndex + 3]}
                    onChange={(v) => updateProblem(rowIndex + 3, v)}
                    readOnly={readOnly}
                    multiline
                    className="care-plan-problem-input"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="care-plan-main-table" dir="ltr">
          <thead>
            <CarePlanHeaderRow />
          </thead>
          <tbody>
            {mainRows.map((row, index) => (
              <tr key={index}>
                <CarePlanRowCells
                  row={row}
                  onChange={(patch) => updateMainRow(index, patch)}
                  readOnly={readOnly}
                />
              </tr>
            ))}
          </tbody>
        </table>

        <PaperFooter schema={schema} page={1} />
      </section>

      {/* ================= الصفحة الثانية ================= */}
      <section className="care-plan-page page-break-before">
        <PaperHeader
          patient={patient}
          onPatientChange={onPatientChange}
          readOnly={readOnly}
        />

        <div className="care-plan-page-two-tables">
          {schema.pageTwoSections.map((section, index) => {
            const row = getSectionRow(section.key);
            return (
              <table
                key={section.key}
                className={`care-plan-specialty-table care-plan-height-${section.rowHeight}`}
                dir="ltr"
              >
                <thead>
                  <tr className="care-plan-specialty-title-row">
                    <th colSpan={6}>
                      <span>{section.titleEnglish}</span>{" "}
                      <span dir="rtl">{section.titleArabic}</span>
                    </th>
                  </tr>
                  {index === 0 && <CarePlanHeaderRow />}
                </thead>
                <tbody>
                  <tr>
                    <CarePlanRowCells
                      row={row}
                      onChange={(patch) => updateSectionRow(section.key, patch)}
                      readOnly={readOnly}
                    />
                  </tr>
                </tbody>
              </table>
            );
          })}
        </div>

        <div className="care-plan-involvement" dir="ltr">
          <div className="care-plan-involvement-title">
            Involvement of health care professionals:
          </div>
          <div className="care-plan-involvement-options">
            {schema.involvementOptions.map((option) => (
              <Checkbox
                key={option.key}
                label={option.label}
                checked={involvement.includes(option.key)}
                onClick={() => toggleInvolvement(option.key)}
                readOnly={readOnly}
              />
            ))}
            <LineInput
              value={data.otherSpecialty || ""}
              onChange={(v) => set("otherSpecialty", v)}
              readOnly={readOnly}
              className="care-plan-other-specialty-line"
            />
          </div>
          <div className="care-plan-responsible-line">
            <span>Most Responsible Physician :</span>
            <LineInput
              value={responsiblePhysician}
              onChange={updateResponsiblePhysician}
              readOnly={readOnly}
              className="care-plan-responsible-name"
            />
            <span>Signature</span>
            <LineInput
              value={data.responsibleSignature || ""}
              onChange={(v) => set("responsibleSignature", v)}
              readOnly={readOnly}
              className="care-plan-responsible-signature"
            />
            <span>Date:</span>
            <LineInput
              value={data.reviewDate || ""}
              onChange={(v) => set("reviewDate", v)}
              readOnly={readOnly}
              placeholder="  /  /  "
              className="care-plan-review-date"
            />
            <span>Time:</span>
            <LineInput
              value={data.reviewTime || ""}
              onChange={(v) => set("reviewTime", v)}
              readOnly={readOnly}
              className="care-plan-review-time"
            />
          </div>
        </div>

        <div className="care-plan-modification-title" dir="ltr">
          N.B: Indications for modification of plan of care:
        </div>
        <div className="care-plan-modification-reasons" dir="ltr">
          {schema.modificationReasons.map((reason) => (
            <div key={reason}>▶ {reason}</div>
          ))}
        </div>

        <PaperFooter schema={schema} page={2} />
      </section>
    </div>
  );
}
