"use client";
import { DoctorOrdersSchema } from "@/lib/formSchemas";

function LineInput({
  value,
  onChange,
  className = "",
  readOnly = false,
}: {
  value: any;
  onChange?: (value: string) => void;
  className?: string;
  readOnly?: boolean;
}) {
  if (readOnly) {
    return <span className={`doctor-orders-value ${className}`}>{value || ""}</span>;
  }
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className={`doctor-orders-input ${className}`}
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
    <div className="doctor-orders-header">
      <div>
        إسم المريض رباعى :
        <LineInput
          value={patient?.name}
          onChange={(value) => onPatientChange?.("name", value)}
          readOnly={readOnly}
          className="doctor-orders-header-line"
        />
      </div>
      <div>
        الرقم الطبى الموحد :
        <LineInput
          value={patient?.patientId}
          onChange={(value) => onPatientChange?.("patientId", value)}
          readOnly={readOnly}
          className="doctor-orders-header-line"
        />
      </div>
    </div>
  );
}

function PaperFooter(_: { schema: DoctorOrdersSchema }) {
  return (
    <div className="doctor-orders-footer doctor-orders-footer-page-only" dir="ltr">
      <b>Page 1 of 1</b>
    </div>
  );
}

function CellTextarea({
  value,
  onChange,
  className = "",
  readOnly = false,
  dir = "rtl",
}: {
  value: any;
  onChange?: (value: string) => void;
  className?: string;
  readOnly?: boolean;
  dir?: "rtl" | "ltr";
}) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      dir={dir}
      className={`doctor-orders-cell-textarea ${className}`}
    />
  );
}

export function DoctorOrdersForm({
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
  schema: DoctorOrdersSchema;
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

  const signature = data.physicianSignature ?? doctorName ?? "";
  const updateSignature = (value: string) => {
    set("physicianSignature", value);
    onDoctorChange?.(value);
  };

  return (
    <div className={`doctor-orders-paper ${compact ? "compact" : ""}`} dir="rtl">
      <section className="doctor-orders-page">
        <PaperHeader
          patient={patient}
          onPatientChange={onPatientChange}
          readOnly={readOnly}
        />

        <div className="doctor-orders-title">
          <span>{schema.titleArabic}</span>
          <b>{schema.titleEnglish}</b>
        </div>

        <div className="doctor-orders-meta">
          <div>
            <span>التشخيص:</span>
            <LineInput
              value={data.diagnosis || ""}
              onChange={(value) => set("diagnosis", value)}
              readOnly={readOnly}
              className="doctor-orders-diagnosis-line"
            />
          </div>
          <div>
            <span>نوع التغذية :</span>
            <LineInput
              value={data.nutritionType || ""}
              onChange={(value) => set("nutritionType", value)}
              readOnly={readOnly}
              className="doctor-orders-nutrition-line"
            />
          </div>
        </div>

        <table className="doctor-orders-table">
          <colgroup>
            <col className="doctor-orders-date-col" />
            <col className="doctor-orders-time-col" />
            <col className="doctor-orders-orders-col" />
            <col className="doctor-orders-sign-col" />
          </colgroup>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الوقت</th>
              <th>الأوامر</th>
              <th>توقيع الطبيب</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <CellTextarea
                  value={data.orderDate || ""}
                  onChange={(value) => set("orderDate", value)}
                  readOnly={readOnly}
                  className="doctor-orders-date-area"
                />
              </td>
              <td>
                <CellTextarea
                  value={data.orderTime || ""}
                  onChange={(value) => set("orderTime", value)}
                  readOnly={readOnly}
                  className="doctor-orders-time-area"
                />
              </td>
              <td className="doctor-orders-main-cell">
                <CellTextarea
                  value={data.orders || ""}
                  onChange={(value) => set("orders", value)}
                  readOnly={readOnly}
                  className="doctor-orders-orders-area"
                />
              </td>
              <td>
                <CellTextarea
                  value={signature}
                  onChange={updateSignature}
                  readOnly={readOnly}
                  className="doctor-orders-sign-area"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="doctor-orders-note">{schema.note}</div>
        <PaperFooter schema={schema} />
      </section>
    </div>
  );
}
