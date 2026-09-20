/**
 * Exact replicas of the original paper forms.
 * Each schema mirrors the printed sheet 1:1 (rows, columns, wording, scores).
 */

/* ============ TYPES ============ */
export type GridCell = { text: string; score: number } | null;

export type GridRow = {
  key: string;
  label: string;
  sublabel?: string;
  type?: "cells" | "gcs";
  required?: boolean;
  cells: GridCell[];
};

export type GridExtra = {
  key: string;
  title: string;
  required?: boolean;
  options: { text: string; score: number }[];
};

export type ScoreGridSchema = {
  layout: "score-grid";
  headerTitle: string;
  dir: "ltr" | "rtl";
  groupHeaders: { label: string; span: number }[];
  columns: string[];
  rows: GridRow[];
  extras?: GridExtra[];
  bands?: { max: number; label: string }[];
  footnote?: string;
  source?: string;
};

export type LevelGridSchema = {
  layout: "level-grid";
  headerTitle: string;
  dir: "ltr" | "rtl";
  key: string;
  columns: string[];
  rows: { value: string; cells: string[] }[];
  footnote?: string;
  source?: string;
};

export type ChecklistRow = {
  key: string;
  no: string;
  text: string; // "\n" = new line inside the same cell
};

export type ChecklistFooterField = {
  key: string;
  type: "text" | "radio" | "textarea";
  before?: string;
  after?: string;
  hint?: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

export type ChecklistSchema = {
  layout: "checklist";
  headerTitle: string;
  dir: "ltr" | "rtl";
  patientBox?: { label: string; value: "name" | "patientId" }[];
  columns: { no: string; name: string; mark: string };
  rows: ChecklistRow[];
  totalRowLabel: string;
  caption?: string;
  footerFields?: ChecklistFooterField[];
  signatureLabel?: string;
  staticBlocks?: { title?: string; paragraphs: string[] }[];
};

export type SectionsSchema = {
  layout?: "sections";
  sections: {
    title: string;
    fields: {
      key: string;
      label: string;
      type: string;
      required?: boolean;
      options?: string[];
      placeholder?: string;
      scoring?: Record<string, number>;
    }[];
  }[];
};

export type PaduaFactor = {
  key: string;
  label: string;
  superscript?: string;
  points: number;
};

export type PaduaPxRow = {
  datetime: string;
  reassess: string;
  decision: "" | "none" | "mechanical" | "pharmacological";
  drug: string;
  physSign: string;
  clinicalSign: string;
};

export type HistoryExamSystemRow = {
  key: string;
  label: string;
  heading?: boolean;
};

export type HistoryExamMedication = {
  drug: string;
  strength: string;
  dosage: string;
  dc: boolean;
  duration: string;
};

export type HistoryExamSchema = {
  layout: "history-exam";
  headerTitle: string;
  revision: string;
  issueNo: string;
  issueDate: string;
  formCode: string;
  historySystems: HistoryExamSystemRow[];
  physicalSystems: HistoryExamSystemRow[];
  medicationRows: number;
};

export const HISTORY_EXAM_SCHEMA: HistoryExamSchema = {
  layout: "history-exam",
  headerTitle: "التاريخ المرضي والفحص الطبي / PERSONAL HISTORY & PHYSICAL EXAMINATION",
  revision: "0",
  issueNo: "1",
  issueDate: "7/1/2024",
  formCode: "TC-F-PHY-G-001",
  historySystems: [
    { key: "general", label: "General" },
    { key: "pain", label: "Pain" },
    { key: "respiratory", label: "Respiratory System" },
    { key: "cardiovascular", label: "Cardiovascular System" },
    { key: "gastrointestinal", label: "Gastrointestinal System" },
    { key: "genitourinary", label: "Genitourinary System" },
    { key: "endocrine", label: "Endocrine System" },
    { key: "neurological", label: "Neurological System" },
  ],
  physicalSystems: [
    { key: "generalAppearance", label: "General Appearance" },
    { key: "skinNeck", label: "Skin & Neck", heading: true },
    { key: "eyes", label: "Eyes" },
    { key: "ears", label: "Ears" },
    { key: "nose", label: "Nose" },
    { key: "mouthPharynx", label: "Mouth & Pharynx" },
    { key: "tongueTeeth", label: "Tongue & Teeth" },
    { key: "thyroid", label: "Thyroid" },
    { key: "ln", label: "L.N" },
    { key: "chest", label: "Chest", heading: true },
    { key: "chestInspection", label: "Inspection" },
    { key: "chestPalpation", label: "Palpation" },
    { key: "chestPercussion", label: "Percussion" },
    { key: "chestAuscultation", label: "Auscultation" },
    { key: "heart", label: "Heart", heading: true },
    { key: "heartInspection", label: "Inspection" },
    { key: "heartPalpation", label: "Palpation" },
    { key: "heartPercussion", label: "Percussion" },
    { key: "heartAuscultation", label: "Auscultation" },
    { key: "abdomen", label: "Abdomen", heading: true },
    { key: "abdomenInspection", label: "Inspection" },
    { key: "abdomenPalpation", label: "Palpation" },
    { key: "abdomenPercussion", label: "Percussion" },
    { key: "abdomenAuscultation", label: "Auscultation" },
    { key: "neurologicalFindings", label: "Neurological Findings", heading: true },
    { key: "cranialNerves", label: "Cranial Nerves" },
    { key: "motorSystem", label: "Motor System" },
    { key: "sensorySystem", label: "Sensory System" },
    { key: "reflexes", label: "Reflexes" },
    { key: "gait", label: "Gait" },
    { key: "musculoskeletal", label: "Musculoskeletal", heading: true },
    { key: "musclesBone", label: "Muscles & Bone" },
    { key: "joints", label: "Joints" },
    { key: "extremities", label: "Extremities" },
    { key: "nutritionalStatus", label: "Nutritional Status" },
    { key: "psychologicalStatus", label: "Psychological Status" },
  ],
  medicationRows: 8,
};

export function isHistoryExam(s: any): s is HistoryExamSchema {
  return s && s.layout === "history-exam";
}

export type DoctorOrdersSchema = {
  layout: "doctor-orders";
  formCode: string;
  revision: string;
  issueNo: string;
  issueDate: string;
  titleArabic: string;
  titleEnglish: string;
  note: string;
  orderLines: number;
};

export const DOCTOR_ORDERS_SCHEMA: DoctorOrdersSchema = {
  layout: "doctor-orders",
  formCode: "TC-F-PHY-G-010",
  revision: "1",
  issueNo: "2",
  issueDate: "7/1/2024",
  titleArabic: "أوامر الطبيب",
  titleEnglish: "Doctor’s Orders",
  note: "جميع الأوامر الطبية لابد أن تكون واضحة و موقعة من الطبيب",
  orderLines: 27,
};

export function isDoctorOrders(s: any): s is DoctorOrdersSchema {
  return s && s.layout === "doctor-orders";
}

export type CarePlanRow = {
  dateTime: string;
  needs: string;
  interventions: string;
  outcome: string;
  timeFrame: string;
  signature: string;
};

export type MultidisciplinaryCareSchema = {
  layout: "multidisciplinary-care";
  formCode: string;
  revision: string;
  issueNo: string;
  issueDate: string;
  titleArabic: string;
  titleEnglish: string;
  physicianPlanTitle: string;
  mainRows: number;
  pageTwoSections: {
    key: string;
    titleArabic: string;
    titleEnglish: string;
    rowHeight: "small" | "medium" | "large";
  }[];
  involvementOptions: { key: string; label: string }[];
  modificationReasons: string[];
};

export const MULTIDISCIPLINARY_CARE_SCHEMA: MultidisciplinaryCareSchema = {
  layout: "multidisciplinary-care",
  formCode: "TC-F-PHY-G-003",
  revision: "0",
  issueNo: "1",
  issueDate: "7/1/2024",
  titleArabic: "خطة رعاية متعددة التخصصات",
  titleEnglish: "Multidisciplinary Plan of Care",
  physicianPlanTitle:
    "Physician plan (Problem list: Allergies, Medical Conditions, Important Medical history, Problems Etc...)",
  mainRows: 3,
  pageTwoSections: [
    {
      key: "otherSpecialties",
      titleArabic: "خطة رعاية التخصصات الأخرى",
      titleEnglish: "Other Specialties Care Plan",
      rowHeight: "large",
    },
    {
      key: "dietitian",
      titleArabic: "خطة رعاية طبيب التغذية",
      titleEnglish: "Dietitian Care plan",
      rowHeight: "small",
    },
    {
      key: "physiotherapist",
      titleArabic: "خطة رعاية أخصائي العلاج الطبيعي",
      titleEnglish: "Physiotherapist Care Plan",
      rowHeight: "medium",
    },
    {
      key: "others",
      titleArabic: "أخرى",
      titleEnglish: "Others",
      rowHeight: "medium",
    },
  ],
  involvementOptions: [
    { key: "nurse", label: "Nurse in charge" },
    { key: "pharmacist", label: "Clinical pharmacist" },
    { key: "other", label: "Other specialty" },
  ],
  modificationReasons: [
    "Transfer to or from ICU",
    "Additional clinical problems that appeared during pt. Stay.",
    "Major changes in patient's condition which require change in plan of care",
  ],
};

export function isMultidisciplinaryCare(
  s: any
): s is MultidisciplinaryCareSchema {
  return s && s.layout === "multidisciplinary-care";
}

export type HealthEducationRow = {
  key: string;
  label: string;
};

export type HealthEducationSection = {
  title: string;
  rows: HealthEducationRow[];
};

export type HealthEducationSchema = {
  layout: "health-education";
  formCode: string;
  revision: string;
  issueNo: string;
  issueDate: string;
  title: string;
  assessmentTitle: string;
  educationOptions: { key: string; label: string }[];
  readinessOptions: { key: string; label: string }[];
  barrierOptions: { key: string; label: string }[];
  recipientOptions: { key: string; label: string }[];
  methodOptions: { key: string; label: string }[];
  sections: HealthEducationSection[];
  followupRows: number;
};

export const HEALTH_EDUCATION_SCHEMA: HealthEducationSchema = {
  layout: "health-education",
  formCode: "TC-F-NUR-G-007",
  revision: "0",
  issueNo: "1",
  issueDate: "7/1/2024",
  title: "التثقيف الصحى للمريض",
  assessmentTitle:
    "تقييم مبدئي للاحتياجات التعليمية للمريض / الأسرة (هذا الجزء يملأ بمعرفة التمريض)",
  educationOptions: [
    { key: "high", label: "مؤهل عالى" },
    { key: "medium", label: "مؤهل متوسط" },
    { key: "readsWrites", label: "يقرأ ويكتب" },
    { key: "illiterate", label: "أمي" },
  ],
  readinessOptions: [
    { key: "willing", label: "يريد ويستجيب" },
    { key: "unwilling", label: "لا يريد ولا يستجيب" },
  ],
  barrierOptions: [
    { key: "sensory", label: "عضوية (السمع – الكلام)" },
    { key: "cognitive", label: "معرفية (مستوى الذكاء والاستيعاب)" },
  ],
  recipientOptions: [
    { key: "patient", label: "المريض" },
    { key: "family", label: "الأسرة" },
  ],
  methodOptions: [
    { key: "oral", label: "شفاهة" },
    { key: "written", label: "مكتوبة" },
    { key: "other", label: "أخرى (اذكر)" },
  ],
  sections: [
    {
      title: "شرح من قبل الأطباء",
      rows: [
        { key: "doctorDiagnosis", label: "شرح التشخيص الطبى" },
        {
          key: "doctorProcedures",
          label: "شرح الإجراءات أو الفحوصات المطلوبة قبل إجرائها",
        },
        {
          key: "doctorTreatment",
          label: "شرح طريقة العلاج والآثار الجانبية",
        },
        { key: "doctorDischarge", label: "تعليمات الخروج والمتابعة" },
        {
          key: "doctorUnderstanding",
          label: "هل تم استيعاب تعليمات الخروج والمتابعة",
        },
      ],
    },
    {
      title: "شرح من قبل الصيدلى",
      rows: [
        { key: "pharmacistInteraction", label: "شرح التفاعل الغذائى الدوائى" },
        { key: "pharmacistOther", label: "أخرى" },
      ],
    },
    {
      title: "شرح من قبل أخصائى العلاج",
      rows: [
        {
          key: "physiotherapy",
          label: "التأهيل الوظيفى (العلاج الطبيعى) عند الحاجة",
        },
      ],
    },
    {
      title: "شرح من قبل أخصائى التغذية",
      rows: [
        { key: "nutritionDiet", label: "هل تم شرح النظام الغذائى" },
        { key: "nutritionOther", label: "أخرى" },
      ],
    },
    {
      title: "شرح من قبل هيئة التمريض",
      rows: [
        {
          key: "nursingDischarge",
          label: "تعليمات الخروج وشرح النظام الغذائى بالمنزل",
        },
        {
          key: "nursingHomeCare",
          label: "الإجراءات التمريضية المتبعة بالمنزل",
        },
      ],
    },
  ],
  followupRows: 9,
};

export function isHealthEducation(s: any): s is HealthEducationSchema {
  return s && s.layout === "health-education";
}

export type PaduaSchema = {
  layout: "padua";
  headerTitle: string;
  dir: "ltr" | "rtl";
  formCode: string;
  revision: string;
  issueNo: string;
  issueDate: string;
  patientLines: { label: string; value: "name" | "patientId" | "department" }[];
  factors: PaduaFactor[];
  footnotes: string[];
  totalLabel: string;
  lowLabel: string;
  highLabel: string;
  recTitle: string;
  recRows: { condition: string; recommendation: string }[];
  pxRowCount: number;
};

export type AnySchema =
  | ScoreGridSchema
  | LevelGridSchema
  | ChecklistSchema
  | PaduaSchema
  | HistoryExamSchema
  | HealthEducationSchema
  | DoctorOrdersSchema
  | MultidisciplinaryCareSchema
  | SectionsSchema;

/* ============ Padua VTE — exact replica of TC-F-3 (front + back) ============ */
export const PADUA_SCHEMA: PaduaSchema = {
  layout: "padua",
  headerTitle:
    "Padua risk score for venous thromboembolism in hospitalized adult medical patients",
  dir: "ltr",
  formCode: "TC-F-3",
  revision: "0",
  issueNo: "01",
  issueDate: "1/1/2026",
  patientLines: [
    { label: "اسم المريض :", value: "name" },
    { label: "الرقم الطبي :", value: "patientId" },
    { label: "قسم :", value: "department" },
  ],
  factors: [
    { key: "activeCancer", label: "Active cancer", superscript: "1", points: 3 },
    {
      key: "previousVTE",
      label: "Previous VTE (with exclusion of superficial vein thrombosis)",
      points: 3,
    },
    { key: "reducedMobility", label: "Reduced mobility", superscript: "2", points: 3 },
    {
      key: "thrombophilia",
      label: "Already known thrombophilia conditions",
      superscript: "3",
      points: 3,
    },
    {
      key: "recentTrauma",
      label: "Recent (≤1 month) trauma and /or surgery",
      points: 2,
    },
    { key: "elderly", label: "Elderly age(≥70years)", points: 1 },
    { key: "heartRespFail", label: "Heart and or respiratory failure", points: 1 },
    {
      key: "miStroke",
      label: "Acute myocardial infraction or ischemic stroke",
      points: 1,
    },
    {
      key: "infectionRheuma",
      label: "Acute infection and or/rheumatologic disorder",
      points: 1,
    },
    { key: "obesity", label: "Obesity (BMI≥30)", points: 1 },
    { key: "hormonal", label: "Ongoing hormonal treatment", points: 1 },
  ],
  footnotes: [
    "¹Patients with local or distant metastases and/or in whom chemotherapy or radiotherapy had been performed in the previous 6 months.",
    "²Bedrest with bathroom privileges (either due to patient’s limitations or on physicians order) for at least 3 days.",
    "³Carriage of defects of antithrombin, protein C or S, factor V Leiden, G20210A prothrombin Mutation, antiphospholipid syndrome.",
  ],
  totalLabel: "Total risk factors scores :",
  lowLabel: "Low risk patients (score <4)",
  highLabel: "High risk patients (score ≥4)",
  recTitle: "VTE Prophylaxis Recommendation Based on Padua RAM",
  recRows: [
    {
      condition: "Low VTE Risk Padua Score < 4 Points",
      recommendation:
        "Pharmacologic prophylaxis is NOT indicated, consider using mechanical prophylaxis.",
    },
    {
      condition: "High VTE Risk Padua Score ≥ 4 Points",
      recommendation:
        "Pharmacologic Prophylaxis is indicated\n*If high risk of bleeding use mechanical prophylaxis",
    },
  ],
  pxRowCount: 14,
};

export function emptyPaduaRows(n: number): PaduaPxRow[] {
  return Array.from({ length: n }, () => ({
    datetime: "",
    reassess: "",
    decision: "",
    drug: "",
    physSign: "",
    clinicalSign: "",
  }));
}

/* ============ ICU Admission Criteria — exact replica ============ */
export const ICU_ADMISSION_SCHEMA: ChecklistSchema = {
  layout: "checklist",
  headerTitle: "Criteria of Admission to ICU",
  dir: "ltr",
  patientBox: [
    { label: "اسم المريض :", value: "name" },
    { label: "الرقم الموحد :", value: "patientId" },
  ],
  columns: { no: "No", name: "Disease Name", mark: "Mark ✓ if present" },
  rows: [
    { key: "c1", no: "1", text: "Sudden fall in level of consciousness (fall in Glasgow coma score >2 points)" },
    { key: "c2", no: "2", text: "Repeated or prolonged seizures" },
    { key: "c3", no: "3", text: "Sepsis" },
    { key: "c4", no: "4", text: "Diabetic ketoacidosis" },
    { key: "c5", no: "5", text: "Eclampsia" },
    { key: "c6", no: "6", text: "Anemia complicated with metabolic acidosis" },
    { key: "c7", no: "7", text: "Shock state with Systolic blood pressure <90 mm Hg" },
    { key: "c8", no: "8", text: "Dehydration complicated with acidosis or DLC" },
    { key: "c9", no: "9", text: "Acute kidney injury" },
    { key: "c10", no: "10", text: "RTA with fall in GCS or polytraumic Rhabdomyolysis" },
    { key: "c11", no: "11", text: "Acute liver injury" },
    { key: "c12", no: "12", text: "Hepatic encephalopathy" },
    { key: "c13", no: "13", text: "Threatened airway\nRespiratory rate ⩾40 or ⩽8 breaths/min" },
    { key: "c14", no: "14", text: "Rising arterial carbon dioxide tension with respiratory acidosis" },
    { key: "c15", no: "15", text: "Hypertensive emergency with end organ damage" },
    { key: "c16", no: "16", text: "All cardiac arrests\nAll respiratory arrests" },
    { key: "c17", no: "17", text: "Pulse rate <40 or >140 beats/min" },
    { key: "c18", no: "18", text: "Oxygen saturation <90% on ⩾50% oxygen" },
  ],
  totalRowLabel: "Number of marks",
  caption: "Disease marked with ✓",
  footerFields: [
    {
      key: "admit_score",
      type: "text",
      before: "Patient should be admitted to ICU at score",
      hint: "(يتم تحديدها من أطباء العناية المركزة)",
      required: true,
      placeholder: "…",
    },
    {
      key: "decision",
      type: "radio",
      before: "So patient",
      after: "admitted to ICU",
      options: ["Should", "Should not"],
      required: true,
    },
  ],
  signatureLabel: "Responsible Physician",
  staticBlocks: [
    {
      title: "DISCHARGED CRITERIA",
      paragraphs: [
        "The status of patients admitted to an ICU should be revised continuously to identify patients who may no longer need ICU care.",
        "A. When a patient's physiologic status has stabilized and the need for ICU monitoring and care is no longer necessary",
        "B. When a patient's physiological status has deteriorated and active interventions are no longer planned, discharge to a lower level of care is appropriate",
        "Discharge criteria from Critical Care Units should be similar to the admitting criteria for the next level of care such as intermediate care where available.",
      ],
    },
  ],
};

/* ============ APACHE II — exact replica of the printed table ============ */
export const APACHE_II_SCHEMA: ScoreGridSchema = {
  layout: "score-grid",
  headerTitle: "The APACHE II Score",
  dir: "ltr",
  groupHeaders: [
    { label: "Physiologic Variable", span: 1 },
    { label: "High Abnormal Range", span: 4 },
    { label: "", span: 1 },
    { label: "Low Abnormal Range", span: 4 },
  ],
  columns: ["+4", "+3", "+2", "+1", "0", "+1", "+2", "+3", "+4"],
  rows: [
    {
      key: "temp",
      label: "Rectal Temp (°C)",
      required: true,
      cells: [
        { text: "≥41", score: 4 },
        { text: "39-40.9", score: 3 },
        null,
        { text: "38.5-38.9", score: 1 },
        { text: "36-38.4", score: 0 },
        { text: "34-35.9", score: 1 },
        { text: "32-33.9", score: 2 },
        { text: "30-31.9", score: 3 },
        { text: "≤29.9", score: 4 },
      ],
    },
    {
      key: "map",
      label: "Mean Arterial Pressure (mmHg)",
      required: true,
      cells: [
        { text: "≥160", score: 4 },
        { text: "130-159", score: 3 },
        { text: "110-129", score: 2 },
        null,
        { text: "70-109", score: 0 },
        null,
        { text: "50-69", score: 2 },
        null,
        { text: "≤49", score: 4 },
      ],
    },
    {
      key: "hr",
      label: "Heart Rate",
      required: true,
      cells: [
        { text: "≥180", score: 4 },
        { text: "140-179", score: 3 },
        { text: "110-139", score: 2 },
        null,
        { text: "70-109", score: 0 },
        null,
        { text: "55-69", score: 2 },
        { text: "40-54", score: 3 },
        { text: "≤39", score: 4 },
      ],
    },
    {
      key: "rr",
      label: "Respiratory Rate",
      required: true,
      cells: [
        { text: "≥50", score: 4 },
        { text: "35-49", score: 3 },
        null,
        { text: "25-34", score: 1 },
        { text: "12-24", score: 0 },
        { text: "10-11", score: 1 },
        { text: "6-9", score: 2 },
        null,
        { text: "≤5", score: 4 },
      ],
    },
    {
      key: "oxygenation",
      label: "Oxygenation",
      sublabel: "a) FIO₂ ≥0.5 record A-aDO₂\nb) FIO₂ <0.5 record PaO₂",
      required: true,
      cells: [
        { text: "≥500", score: 4 },
        { text: "350-499", score: 3 },
        { text: "200-349", score: 2 },
        null,
        { text: "<200\nPO₂ >70", score: 0 },
        { text: "PO₂ 61-70", score: 1 },
        null,
        { text: "PO₂ 55-60", score: 3 },
        { text: "PO₂ <55", score: 4 },
      ],
    },
    {
      key: "ph",
      label: "Arterial pH",
      required: true,
      cells: [
        { text: "≥7.7", score: 4 },
        { text: "7.6-7.69", score: 3 },
        null,
        { text: "7.5-7.59", score: 1 },
        { text: "7.33-7.49", score: 0 },
        null,
        { text: "7.25-7.32", score: 2 },
        { text: "7.15-7.24", score: 3 },
        { text: "<7.15", score: 4 },
      ],
    },
    {
      key: "hco3",
      label: "HCO₃ (mEq/l)",
      required: true,
      cells: [
        { text: "≥52", score: 4 },
        { text: "41-51.9", score: 3 },
        null,
        { text: "32-40.9", score: 1 },
        { text: "22-31.9", score: 0 },
        null,
        { text: "18-21.9", score: 2 },
        { text: "15-17.9", score: 3 },
        { text: "<15", score: 4 },
      ],
    },
    {
      key: "potassium",
      label: "K (mEq/l)",
      required: true,
      cells: [
        { text: "≥7", score: 4 },
        { text: "6-6.9", score: 3 },
        null,
        { text: "5.5-5.9", score: 1 },
        { text: "3.5-5.4", score: 0 },
        { text: "3-3.4", score: 1 },
        { text: "2.5-2.9", score: 2 },
        null,
        { text: "<2.5", score: 4 },
      ],
    },
    {
      key: "sodium",
      label: "Na (mEq/l)",
      required: true,
      cells: [
        { text: "≥180", score: 4 },
        { text: "160-179", score: 3 },
        { text: "155-159", score: 2 },
        { text: "150-154", score: 1 },
        { text: "130-149", score: 0 },
        null,
        { text: "120-129", score: 2 },
        { text: "111-119", score: 3 },
        { text: "≤110", score: 4 },
      ],
    },
    {
      key: "creatinine",
      label: "S. Creat (mgm/dl)",
      required: true,
      cells: [
        { text: "≥3.5", score: 4 },
        { text: "2-3.4", score: 3 },
        { text: "1.5-1.9", score: 2 },
        null,
        { text: "0.6-1.4", score: 0 },
        null,
        { text: "<0.6", score: 2 },
        null,
        null,
      ],
    },
    {
      key: "hematocrit",
      label: "Hematocrit (%)",
      required: true,
      cells: [
        { text: "≥60", score: 4 },
        null,
        { text: "50-59.9", score: 2 },
        { text: "46-49.9", score: 1 },
        { text: "30-45.9", score: 0 },
        null,
        { text: "20-29.9", score: 2 },
        null,
        { text: "<20", score: 4 },
      ],
    },
    {
      key: "tlc",
      label: "TLC (10³/cc)",
      required: true,
      cells: [
        { text: "≥40", score: 4 },
        null,
        { text: "20-39.9", score: 2 },
        { text: "15-19.9", score: 1 },
        { text: "3-14.9", score: 0 },
        null,
        { text: "1-2.9", score: 2 },
        null,
        { text: "<1", score: 4 },
      ],
    },
    {
      key: "gcs",
      label: "GCS",
      type: "gcs",
      required: true,
      cells: [],
    },
  ],
  extras: [
    {
      key: "age_score",
      title: "Age - score",
      required: true,
      options: [
        { text: "<44  →  0", score: 0 },
        { text: "45-54  →  2", score: 2 },
        { text: "55-64  →  3", score: 3 },
        { text: "65-74  →  5", score: 5 },
        { text: "≥75  →  6", score: 6 },
      ],
    },
  ],
  bands: [
    { max: 4, label: "0-4 — تقدير وفيات تقريبي ~4%" },
    { max: 9, label: "5-9 — تقدير وفيات تقريبي ~8%" },
    { max: 14, label: "10-14 — تقدير وفيات تقريبي ~15%" },
    { max: 19, label: "15-19 — تقدير وفيات تقريبي ~25%" },
    { max: 24, label: "20-24 — تقدير وفيات تقريبي ~40%" },
    { max: 29, label: "25-29 — تقدير وفيات تقريبي ~55%" },
    { max: 34, label: "30-34 — تقدير وفيات تقريبي ~73%" },
    { max: 999, label: "≥35 — تقدير وفيات تقريبي ~85%" },
  ],
  footnote:
    "GCS score = 15 − actual GCS  (15→0, 14→1, 13→2, 12→3, 11→4, 10→5, 9→6, 8→7, 7→8, 6→9, 5→10, 4→11, 3→12)",
  source: "JAMA 1993;270(24):2957-2963",
};

/* ============ PPS — Palliative Performance Scale (Appendix A) ============ */
export const PPS_SCHEMA: LevelGridSchema = {
  layout: "level-grid",
  headerTitle: "Appendix A: Palliative Performance Scale (PPS)",
  dir: "ltr",
  key: "pps_level",
  columns: [
    "PPS Level",
    "Ambulation",
    "Activity & Evidence of Disease",
    "Self-Care",
    "Intake",
    "Conscious Level",
  ],
  rows: [
    { value: "100%", cells: ["100%", "Full", "Normal activity & work\nNo evidence of disease", "Full", "Normal", "Full"] },
    { value: "90%", cells: ["90%", "Full", "Normal activity & work\nSome evidence of disease", "Full", "Normal", "Full"] },
    { value: "80%", cells: ["80%", "Full", "Normal activity with effort\nSome evidence of disease", "Full", "Normal or reduced", "Full"] },
    { value: "70%", cells: ["70%", "Reduced", "Unable normal job/work\nSignificant disease", "Full", "Normal or reduced", "Full"] },
    { value: "60%", cells: ["60%", "Reduced", "Unable hobby/house work\nSignificant disease", "Occasional assistance necessary", "Normal or reduced", "Full or confusion"] },
    { value: "50%", cells: ["50%", "Mainly Sit/Lie", "Unable to do any work\nExtensive disease", "Occasional assistance required", "Normal or reduced", "Full or confusion"] },
    { value: "40%", cells: ["40%", "Mainly in Bed", "Unable to do most activity\nExtensive disease", "Mainly assistance", "Normal or reduced", "Full or drowsy\n+/- confusion"] },
    { value: "30%", cells: ["30%", "Totally Bed Bound", "Unable to do any activity\nExtensive disease", "Total Care", "Normal or reduced", "Full or drowsy\n+/- confusion"] },
    { value: "20%", cells: ["20%", "Totally Bed Bound", "Unable to do any activity\nExtensive disease", "Total Care", "Minimal to sips", "Full or drowsy\n+/- confusion"] },
    { value: "10%", cells: ["10%", "Totally Bed Bound", "Unable to do any activity\nExtensive disease", "Total Care", "Mouth care only", "Drowsy or coma\n+/- confusion"] },
    { value: "0%", cells: ["0%", "Death", "—", "—", "—", "—"] },
  ],
  footnote: "Copyright 2001 © Victoria Hospice Society",
};

/* ============ GCS conversion helper ============ */
export const GCS_VALUES = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3];
export const gcsPoints = (gcs: number) => 15 - gcs;

/* ============ SCORING ============ */
export type ScoreBreakdown = {
  total: number;
  label: string | null;
  parts: { label: string; value: string; points: number }[];
  missing: string[];
};

export function isScoreGrid(s: any): s is ScoreGridSchema {
  return s && s.layout === "score-grid";
}
export function isLevelGrid(s: any): s is LevelGridSchema {
  return s && s.layout === "level-grid";
}
export function isChecklist(s: any): s is ChecklistSchema {
  return s && s.layout === "checklist";
}
export function isPadua(s: any): s is PaduaSchema {
  return s && s.layout === "padua";
}

export function computePaduaScore(schema: PaduaSchema, data: Record<string, any>) {
  let total = 0;
  const parts: { label: string; points: number }[] = [];
  for (const f of schema.factors) {
    if (data[f.key]) {
      total += f.points;
      parts.push({ label: f.label, points: f.points });
    }
  }
  const high = total >= 4;
  return {
    total,
    high,
    label: high ? schema.highLabel : schema.lowLabel,
    parts,
  };
}

export function countChecklistMarks(
  schema: ChecklistSchema,
  data: Record<string, any>
) {
  return schema.rows.filter((r) => !!data[r.key]).length;
}

export function validateChecklist(
  schema: ChecklistSchema,
  data: Record<string, any>
): string[] {
  const missing: string[] = [];
  for (const f of schema.footerFields ?? []) {
    if (!f.required) continue;
    const v = data[f.key];
    if (v === undefined || v === null || v === "") {
      missing.push(f.before || f.key);
    }
  }
  return missing;
}

export function computeGridScore(
  schema: ScoreGridSchema,
  data: Record<string, any>
): ScoreBreakdown {
  let total = 0;
  const parts: ScoreBreakdown["parts"] = [];
  const missing: string[] = [];

  for (const row of schema.rows) {
    const raw = data[row.key];
    const empty = raw === undefined || raw === null || raw === "";
    if (row.type === "gcs") {
      if (empty) {
        if (row.required) missing.push(row.label);
        continue;
      }
      const pts = gcsPoints(Number(raw));
      total += pts;
      parts.push({ label: row.label, value: `GCS ${raw}`, points: pts });
      continue;
    }
    if (empty) {
      if (row.required) missing.push(row.label);
      continue;
    }
    const cell = row.cells[Number(raw)];
    if (cell) {
      total += cell.score;
      parts.push({ label: row.label, value: cell.text.replace(/\n/g, " "), points: cell.score });
    }
  }

  for (const ex of schema.extras ?? []) {
    const raw = data[ex.key];
    if (raw === undefined || raw === null || raw === "") {
      if (ex.required) missing.push(ex.title);
      continue;
    }
    const opt = ex.options[Number(raw)];
    if (opt) {
      total += opt.score;
      parts.push({ label: ex.title, value: opt.text, points: opt.score });
    }
  }

  let label: string | null = null;
  if (schema.bands) {
    const band = schema.bands.find((b) => total <= b.max);
    label = band ? band.label : null;
  }

  return { total, label, parts, missing };
}
