// Seed: 16 default form templates + admin user
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { formTemplates, users } from "@/db/schema";
import { eq, inArray, notInArray, sql } from "drizzle-orm";
import { APACHE_II_SCHEMA, PPS_SCHEMA, ICU_ADMISSION_SCHEMA, PADUA_SCHEMA, HISTORY_EXAM_SCHEMA, HEALTH_EDUCATION_SCHEMA, DOCTOR_ORDERS_SCHEMA, MULTIDISCIPLINARY_CARE_SCHEMA } from "@/lib/formSchemas";
import {
  FORM_WORKFLOW,
  FORM_WORKFLOW_NAMES,
  VTE_LEGACY_NAMES,
} from "@/lib/formWorkflow";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "checkbox" | "radio" | "dropdown" | "textarea" | "signature";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  scoring?: { [opt: string]: number };
};

export type SectionDef = { title: string; fields: FieldDef[] };
export type FormSchema = { sections: SectionDef[] };

const templates: Array<{
  name: string;
  icon: string;
  scoringType?: string;
  schema: any;
}> = [
  {
    name: "طلب استشارة طبية",
    icon: "Stethoscope",
    schema: {
      sections: [
        {
          title: "بيانات الاستشارة",
          fields: [
            { key: "reason", label: "سبب الاستشارة", type: "textarea", required: true },
            { key: "urgency", label: "درجة الاستعجال", type: "dropdown", required: true, options: ["عاجل", "شبه عاجل", "غير عاجل"] },
            { key: "specialty", label: "التخصص المطلوب", type: "text", required: true },
            { key: "history", label: "ملخص التاريخ المرضي", type: "textarea" },
            { key: "currentMeds", label: "الأدوية الحالية", type: "textarea" },
            { key: "allergies", label: "الحساسية", type: "textarea" },
            { key: "questions", label: "الأسئلة المطروحة على الاستشاري", type: "textarea" },
          ],
        },
      ],
    },
  },
  {
    name: "التاريخ المرضي والفحص الطبي",
    icon: "ClipboardList",
    schema: {
      sections: [
        {
          title: "الشكوى الرئيسية",
          fields: [
            { key: "chiefComplaint", label: "الشكوى الرئيسية", type: "textarea", required: true },
            { key: "duration", label: "مدة الأعراض", type: "text" },
          ],
        },
        {
          title: "التاريخ المرضي الحالي",
          fields: [
            { key: "presentIllness", label: "التاريخ المرضي الحالي", type: "textarea" },
          ],
        },
        {
          title: "التاريخ المرضي السابق",
          fields: [
            { key: "pastMedical", label: "الأمراض السابقة", type: "textarea" },
            { key: "pastSurgical", label: "العمليات السابقة", type: "textarea" },
            { key: "familyHistory", label: "التاريخ العائلي", type: "textarea" },
            { key: "smoking", label: "التدخين", type: "dropdown", options: ["لا", "نعم - سابقاً", "نعم - حالياً"] },
          ],
        },
        {
          title: "الفحص الطبي",
          fields: [
            { key: "temp", label: "درجة الحرارة (°C)", type: "number" },
            { key: "bp", label: "ضغط الدم", type: "text", placeholder: "120/80" },
            { key: "pulse", label: "النبض", type: "number" },
            { key: "rr", label: "معدل التنفس", type: "number" },
            { key: "spo2", label: "تشبع الأكسجين %", type: "number" },
            { key: "weight", label: "الوزن (كجم)", type: "number" },
            { key: "height", label: "الطول (سم)", type: "number" },
            { key: "generalExam", label: "الفحص العام", type: "textarea" },
            { key: "systemicExam", label: "الفحص الجهازي", type: "textarea" },
          ],
        },
        {
          title: "التشخيص والخطة",
          fields: [
            { key: "provisionalDx", label: "التشخيص المبدئي", type: "textarea" },
            { key: "plan", label: "الخطة العلاجية", type: "textarea" },
          ],
        },
      ],
    },
  },
  {
    name: "معايير دخول العناية المركزة",
    icon: "Activity",
    schema: {
      sections: [
        {
          title: "تقييم الحاجة للعناية المركزة",
          fields: [
            { key: "indication", label: "دواعي الدخول", type: "textarea", required: true },
            { key: "hemodynamic", label: "عدم استقرار الدورة الدموية", type: "radio", options: ["نعم", "لا"], required: true },
            { key: "respiratory", label: "فشل تنفسي", type: "radio", options: ["نعم", "لا"], required: true },
            { key: "neurological", label: "اضطراب عصبي شديد", type: "radio", options: ["نعم", "لا"], required: true },
            { key: "ventilator", label: "حاجة لجهاز تنفس صناعي", type: "radio", options: ["نعم", "لا"], required: true },
            { key: "vasopressors", label: "حاجة لأدوية رافعة للضغط", type: "radio", options: ["نعم", "لا"], required: true },
            { key: "monitoring", label: "نوع المراقبة المطلوبة", type: "textarea" },
            { key: "expectedStay", label: "مدة الإقامة المتوقعة", type: "text" },
          ],
        },
      ],
    },
  },
  {
    name: "تقييم Padua لخطر الجلطات الوريدية والوقاية منها (VTE / Padua RAM)",
    icon: "HeartPulse",
    scoringType: "padua",
    schema: PADUA_SCHEMA,
  },
  {
    name: "تقييم Caprini للتجلطات الدموية الوريدية",
    icon: "ShieldAlert",
    scoringType: "caprini",
    schema: {
      sections: [
        {
          title: "عوامل نقطة واحدة",
          fields: [
            { key: "c1a", label: "العمر 41-60", type: "checkbox", scoring: { "yes": 1 } },
            { key: "c1b", label: "جراحة بسيطة", type: "checkbox", scoring: { "yes": 1 } },
            { key: "c1c", label: "دوالي الساقين", type: "checkbox", scoring: { "yes": 1 } },
            { key: "c1d", label: "أمراض التهاب الأمعاء", type: "checkbox", scoring: { "yes": 1 } },
            { key: "c1e", label: "تورم الساقين", type: "checkbox", scoring: { "yes": 1 } },
            { key: "c1f", label: "سمنة BMI > 25", type: "checkbox", scoring: { "yes": 1 } },
          ],
        },
        {
          title: "عوامل نقطتان",
          fields: [
            { key: "c2a", label: "العمر 61-74", type: "checkbox", scoring: { "yes": 2 } },
            { key: "c2b", label: "جراحة كبرى", type: "checkbox", scoring: { "yes": 2 } },
            { key: "c2c", label: "السرطان", type: "checkbox", scoring: { "yes": 2 } },
            { key: "c2d", label: "الحمل أو ما بعد الولادة", type: "checkbox", scoring: { "yes": 2 } },
            { key: "c2e", label: "استخدام حبوب منع الحمل", type: "checkbox", scoring: { "yes": 2 } },
          ],
        },
        {
          title: "عوامل 3 نقاط",
          fields: [
            { key: "c3a", label: "العمر ≥ 75", type: "checkbox", scoring: { "yes": 3 } },
            { key: "c3b", label: "جلطة وريدية سابقة", type: "checkbox", scoring: { "yes": 3 } },
            { key: "c3c", label: "عامل تخثر إيجابي", type: "checkbox", scoring: { "yes": 3 } },
          ],
        },
        {
          title: "عوامل 5 نقاط",
          fields: [
            { key: "c5a", label: "سكتة دماغية حديثة", type: "checkbox", scoring: { "yes": 5 } },
            { key: "c5b", label: "إصابة حادة بالنخاع الشوكي", type: "checkbox", scoring: { "yes": 5 } },
            { key: "c5c", label: "كسر بالورك أو الحوض أو الساق", type: "checkbox", scoring: { "yes": 5 } },
          ],
        },
      ],
    },
  },
  {
    name: "مقياس APACHE II",
    icon: "BarChart3",
    scoringType: "grid",
    schema: APACHE_II_SCHEMA,
  },
  {
    name: "ملاحظات التقدم الإكلينيكي لطبيب الرعاية المركزة",
    icon: "NotebookPen",
    schema: {
      sections: [
        {
          title: "الحالة العامة",
          fields: [
            { key: "consciousness", label: "درجة الوعي", type: "dropdown", options: ["واعي تماماً", "مشوش", "غير مستجيب"], required: true },
            { key: "vitals", label: "العلامات الحيوية", type: "textarea" },
            { key: "ventilatorSettings", label: "إعدادات جهاز التنفس", type: "textarea" },
            { key: "fluidBalance", label: "میزان السوائل (دخل/خرج)", type: "textarea" },
          ],
        },
        {
          title: "التقييم اليومي",
          fields: [
            { key: "systemsReview", label: "مراجعة الأجهزة", type: "textarea" },
            { key: "investigations", label: "نتائج الفحوصات", type: "textarea" },
            { key: "assessment", label: "التقييم", type: "textarea", required: true },
            { key: "plan", label: "خطة اليوم", type: "textarea", required: true },
            { key: "goals", label: "أهداف الرعاية لليوم", type: "textarea" },
          ],
        },
      ],
    },
  },
  {
    name: "خطة الرعاية الطبية متعددة التخصصات",
    icon: "Users",
    schema: {
      sections: [
        {
          title: "فريق الرعاية",
          fields: [
            { key: "team", label: "أعضاء الفريق المشارك", type: "textarea", required: true },
            { key: "problems", label: "قائمة المشكلات الطبية", type: "textarea", required: true },
          ],
        },
        {
          title: "الأهداف والخطة",
          fields: [
            { key: "shortTermGoals", label: "الأهداف قصيرة المدى", type: "textarea" },
            { key: "longTermGoals", label: "الأهداف طويلة المدى", type: "textarea" },
            { key: "interventions", label: "التدخلات المخططة لكل تخصص", type: "textarea", required: true },
            { key: "followUp", label: "المتابعة", type: "textarea" },
            { key: "discharge", label: "التخطيط للخروج", type: "textarea" },
          ],
        },
      ],
    },
  },
  {
    name: "أوامر الطبيب",
    icon: "ClipboardCheck",
    schema: {
      sections: [
        {
          title: "الأوامر الطبية",
          fields: [
            { key: "admitTo", label: "يُدخل إلى", type: "text", required: true },
            { key: "diagnosis", label: "التشخيص", type: "text", required: true },
            { key: "condition", label: "الحالة", type: "dropdown", options: ["جيدة", "متوسطة", "حرجة"], required: true },
            { key: "diet", label: "النظام الغذائي", type: "dropdown", options: ["عادي", "سوائل", "صفر فموياً", "غذاء خاص"], required: true },
            { key: "activity", label: "الحركة", type: "dropdown", options: ["راحة تامة", "حركة محدودة", "حركة حرة"], required: true },
            { key: "vitals", label: "قياس العلامات الحيوية", type: "text", placeholder: "كل 4 ساعات" },
            { key: "intake", label: "قياس المدخلات والمخرجات", type: "dropdown", options: ["نعم", "لا"] },
            { key: "ivFluids", label: "السوائل الوريدية", type: "textarea" },
            { key: "oxygen", label: "الأكسجين", type: "text" },
            { key: "labs", label: "التحاليل المطلوبة", type: "textarea" },
            { key: "imaging", label: "الأشعة المطلوبة", type: "textarea" },
            { key: "specialInstructions", label: "تعليمات خاصة", type: "textarea" },
          ],
        },
      ],
    },
  },
  {
    name: "وصف وإعطاء علاج منتظم",
    icon: "Pill",
    schema: {
      sections: [
        {
          title: "الأدوية المنتظمة",
          fields: [
            { key: "med1", label: "الدواء 1 (الاسم / الجرعة / التوقيت / طريقة الإعطاء)", type: "text" },
            { key: "med2", label: "الدواء 2", type: "text" },
            { key: "med3", label: "الدواء 3", type: "text" },
            { key: "med4", label: "الدواء 4", type: "text" },
            { key: "med5", label: "الدواء 5", type: "text" },
            { key: "med6", label: "الدواء 6", type: "text" },
            { key: "med7", label: "الدواء 7", type: "text" },
            { key: "med8", label: "الدواء 8", type: "text" },
            { key: "allergiesNote", label: "الحساسية المعروفة", type: "textarea" },
            { key: "specialNotes", label: "ملاحظات خاصة", type: "textarea" },
          ],
        },
      ],
    },
  },
  {
    name: "وصف وإعطاء علاج مرة واحدة",
    icon: "Syringe",
    schema: {
      sections: [
        {
          title: "الأدوية لمرة واحدة / حسب الحاجة",
          fields: [
            { key: "drugName", label: "اسم الدواء", type: "text", required: true },
            { key: "dose", label: "الجرعة", type: "text", required: true },
            { key: "route", label: "طريق الإعطاء", type: "dropdown", options: ["فموي", "وريدي", "عضلي", "تحت الجلد", "موضعي", "شرجي"], required: true },
            { key: "indication", label: "دواعي الاستخدام", type: "text", required: true },
            { key: "givenAt", label: "أُعطى في (التاريخ والوقت)", type: "text" },
            { key: "response", label: "استجابة المريض", type: "textarea" },
            { key: "sideEffects", label: "أي أعراض جانبية", type: "textarea" },
          ],
        },
      ],
    },
  },
  {
    name: "وصف وإعطاء محاليل وريدية",
    icon: "Droplet",
    schema: {
      sections: [
        {
          title: "المحاليل الوريدية",
          fields: [
            { key: "fluid1", label: "المحلول 1 (النوع / الحجم / المعدل)", type: "text" },
            { key: "fluid2", label: "المحلول 2", type: "text" },
            { key: "fluid3", label: "المحلول 3", type: "text" },
            { key: "additives", label: "الإضافات للمحلول", type: "textarea" },
            { key: "rate", label: "معدل التسريب (مل/ساعة)", type: "text" },
            { key: "totalDaily", label: "الإجمالي اليومي", type: "text" },
            { key: "monitoring", label: "المراقبة المطلوبة", type: "textarea" },
            { key: "notes", label: "ملاحظات", type: "textarea" },
          ],
        },
      ],
    },
  },
  {
    name: "ملائمة الأدوية",
    icon: "CheckCircle2",
    schema: {
      sections: [
        {
          title: "مراجعة ملاءمة الدواء",
          fields: [
            { key: "drug", label: "اسم الدواء", type: "text", required: true },
            { key: "indication", label: "دواعي الاستخدام", type: "text", required: true },
            { key: "appropriate", label: "مناسب للحالة", type: "radio", options: ["نعم", "لا", "تحت المراجعة"], required: true },
            { key: "doseAppropriate", label: "الجرعة مناسبة", type: "radio", options: ["نعم", "لا"], required: true },
            { key: "frequency", label: "التكرار مناسب", type: "radio", options: ["نعم", "لا"], required: true },
            { key: "route", label: "طريق الإعطاء مناسب", type: "radio", options: ["نعم", "لا"], required: true },
            { key: "duration", label: "المدة مناسبة", type: "radio", options: ["نعم", "لا"], required: true },
            { key: "interactions", label: "تفاعلات دوائية", type: "textarea" },
            { key: "contraindications", label: "موانع الاستخدام", type: "textarea" },
            { key: "adjustments", label: "التعديلات المطلوبة", type: "textarea" },
            { key: "pharmacist", label: "ملاحظات الصيدلي", type: "textarea" },
          ],
        },
      ],
    },
  },
  {
    name: "التثقيف الصحي للمريض",
    icon: "BookOpen",
    schema: {
      sections: [
        {
          title: "جلسة التثقيف الصحي",
          fields: [
            { key: "topic", label: "موضوع التثقيف", type: "text", required: true },
            { key: "diagnosisExplained", label: "شرح التشخيص للمريض", type: "textarea" },
            { key: "treatmentExplained", label: "شرح خطة العلاج", type: "textarea" },
            { key: "medications", label: "تعليمات الأدوية", type: "textarea" },
            { key: "lifestyle", label: "التعليمات الغذائية ونمط الحياة", type: "textarea" },
            { key: "warningSigns", label: "علامات الخطر التي تستدعي العودة", type: "textarea" },
            { key: "followUp", label: "موعد المتابعة", type: "text" },
            { key: "understanding", label: "درجة استيعاب المريض", type: "dropdown", options: ["ممتاز", "جيد", "متوسط", "ضعيف"] },
            { key: "language", label: "لغة التثقيف", type: "text" },
            { key: "companion", label: "وجود مرافق", type: "radio", options: ["نعم", "لا"] },
          ],
        },
      ],
    },
  },
  {
    name: "ملخص الخروج",
    icon: "FileCheck",
    schema: {
      sections: [
        {
          title: "بيانات الخروج",
          fields: [
            { key: "dischargeDate", label: "تاريخ الخروج", type: "date", required: true },
            { key: "dischargeCondition", label: "الحالة عند الخروج", type: "dropdown", options: ["ممتازة", "جيدة", "متوسطة", "حرجة"], required: true },
            { key: "dischargeDisposition", label: "الجهة المحول إليها", type: "dropdown", options: ["المنزل", "مركز تأهيل", "مستشفى آخر", "متابعة خارجية"] },
          ],
        },
        {
          title: "الملخص الطبي",
          fields: [
            { key: "admissionDx", label: "التشخيص عند الدخول", type: "textarea", required: true },
            { key: "finalDx", label: "التشخيص النهائي", type: "textarea", required: true },
            { key: "procedures", label: "الإجراءات والعمليات", type: "textarea" },
            { key: "hospitalCourse", label: "ملخص فترة الإقامة", type: "textarea", required: true },
            { key: "dischargeMeds", label: "الأدوية عند الخروج", type: "textarea", required: true },
            { key: "activityDiet", label: "النشاط والغذاء", type: "textarea" },
            { key: "followUp", label: "موعد المتابعة والطبيب", type: "text", required: true },
            { key: "warningSigns", label: "علامات التحذير", type: "textarea" },
            { key: "patientInstructions", label: "تعليمات المريض", type: "textarea" },
          ],
        },
      ],
    },
  },
  {
    name: "طلب تحليل معمل",
    icon: "TestTube2",
    schema: {
      sections: [
        {
          title: "التحاليل المطلوبة",
          fields: [
            { key: "hematology", label: "أمراض الدم (CBC, ESR, ...)", type: "textarea" },
            { key: "biochemistry", label: "الكيمياء الحيوية (سكر، كلى، كبد، ...)", type: "textarea" },
            { key: "microbiology", label: "الميكروبيولوجي (مزارع، ...)", type: "textarea" },
            { key: "serology", label: "السيروجيلي (أجسام مضادة، ...)", type: "textarea" },
            { key: "urine", label: "تحليل بول", type: "dropdown", options: ["كامل", "مزرعة", "لا"], required: true },
            { key: "stool", label: "تحليل براز", type: "dropdown", options: ["كامل", "مزرعة", "لا"], required: true },
            { key: "other", label: "تحاليل أخرى", type: "textarea" },
            { key: "clinicalInfo", label: "معلومات سريرية للمعمل", type: "textarea" },
            { key: "urgency", label: "درجة الاستعجال", type: "dropdown", options: ["روتيني", "عاجل"], required: true },
          ],
        },
      ],
    },
  },
];

/**
 * Templates rebuilt 1:1 from the original paper forms.
 * These are kept in sync on every boot (upsert by name) so that
 * corrections to the replica reach the app immediately.
 */
const AUTHORITATIVE: Array<{
  name: string;
  icon: string;
  scoringType: string | null;
  schema: any;
  orderIndex: number;
}> = [
  {
    name: FORM_WORKFLOW[0].name,
    icon: "ClipboardList",
    scoringType: null,
    schema: HISTORY_EXAM_SCHEMA,
    orderIndex: 0,
  },
  {
    name: FORM_WORKFLOW[1].name,
    icon: "Users",
    scoringType: null,
    schema: MULTIDISCIPLINARY_CARE_SCHEMA,
    orderIndex: 1,
  },
  {
    name: FORM_WORKFLOW[2].name,
    icon: "HeartPulse",
    scoringType: "padua",
    schema: PADUA_SCHEMA,
    orderIndex: 2,
  },
  {
    name: FORM_WORKFLOW[3].name,
    icon: "ClipboardCheck",
    scoringType: null,
    schema: DOCTOR_ORDERS_SCHEMA,
    orderIndex: 3,
  },
  {
    name: FORM_WORKFLOW[4].name,
    icon: "BookOpen",
    scoringType: null,
    schema: HEALTH_EDUCATION_SCHEMA,
    orderIndex: 4,
  },
];

export async function seedDatabase() {
  // Check existing admin
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .limit(1);

  if (existing.length === 0) {
    const adminHash = await bcrypt.hash("admin123", 10);
    const doctorHash = await bcrypt.hash("doctor123", 10);
    await db.insert(users).values([
      {
        username: "admin",
        passwordHash: adminHash,
        name: "مدير النظام",
        specialty: "إدارة المستشفى",
        role: "admin",
        isActive: true,
      },
      {
        username: "mostafa",
        passwordHash: doctorHash,
        name: "د. مصطفى الشناوي",
        specialty: "استشاري أمراض القلب والأوعية الدموية",
        role: "doctor",
        isActive: true,
      },
    ]);
  }

  const existingT = await db.select({ id: formTemplates.id }).from(formTemplates).limit(1);
  if (existingT.length === 0) {
    await db.insert(formTemplates).values(
      templates.map((t, i) => ({
        name: t.name,
        icon: t.icon,
        schema: t.schema,
        scoringType: t.scoringType ?? null,
        isActive: true,
        orderIndex: i,
      }))
    );
  }

  // Rename the existing Padua/VTE paper to the short workflow name while
  // preserving its id and any linked submissions.
  const [currentVte] = await db
    .select()
    .from(formTemplates)
    .where(eq(formTemplates.name, FORM_WORKFLOW[2].name))
    .limit(1);
  const legacyVteRows = await db
    .select()
    .from(formTemplates)
    .where(inArray(formTemplates.name, [...VTE_LEGACY_NAMES]));

  let canonicalVte = currentVte;
  if (!canonicalVte && legacyVteRows.length > 0) {
    [canonicalVte] = await db
      .update(formTemplates)
      .set({ name: FORM_WORKFLOW[2].name, updatedAt: new Date() })
      .where(eq(formTemplates.id, legacyVteRows[0].id))
      .returning();
  }
  if (canonicalVte) {
    for (const legacy of legacyVteRows) {
      if (legacy.id === canonicalVte.id) continue;
      await db.execute(sql`
        UPDATE form_submissions
        SET template_id = ${canonicalVte.id}
        WHERE template_id = ${legacy.id}
      `);
      await db.delete(formTemplates).where(eq(formTemplates.id, legacy.id));
    }
  }

  // Keep only the five workflow papers, in exact exam order.
  for (const t of AUTHORITATIVE) {
    const [row] = await db
      .select()
      .from(formTemplates)
      .where(eq(formTemplates.name, t.name))
      .limit(1);

    if (row) {
      await db
        .update(formTemplates)
        .set({
          schema: t.schema,
          scoringType: t.scoringType,
          icon: t.icon,
          isActive: true,
          orderIndex: t.orderIndex,
          updatedAt: new Date(),
        })
        .where(eq(formTemplates.id, row.id));
    } else {
      await db.insert(formTemplates).values({
        name: t.name,
        icon: t.icon,
        schema: t.schema,
        scoringType: t.scoringType,
        isActive: true,
        orderIndex: t.orderIndex,
      });
    }
  }

  // User requested permanent deletion of every form outside the exam flow.
  await db
    .delete(formTemplates)
    .where(notInArray(formTemplates.name, [...FORM_WORKFLOW_NAMES]));
}
