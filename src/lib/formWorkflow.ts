export const FORM_WORKFLOW = [
  {
    key: "history",
    name: "التاريخ المرضي والفحص الطبي",
    shortName: "التاريخ المرضي",
    description: "التاريخ الشخصي والمرضي والفحص الطبي الكامل",
  },
  {
    key: "care-plan",
    name: "خطة الرعاية الطبية متعددة التخصصات",
    shortName: "خطة الرعاية",
    description: "خطة الطبيب وباقي تخصصات فريق الرعاية",
  },
  {
    key: "vte",
    name: "نموذج VTE",
    shortName: "تقييم VTE",
    description: "تقييم Padua وخطة الوقاية من الجلطات الوريدية",
  },
  {
    key: "orders",
    name: "أوامر الطبيب",
    shortName: "أوامر الطبيب",
    description: "التاريخ والوقت والأوامر والتوقيع",
  },
  {
    key: "education",
    name: "التثقيف الصحي للمريض",
    shortName: "التثقيف الصحي",
    description: "الاحتياجات التعليمية وتوثيق شرح فريق الرعاية",
  },
] as const;

export const FORM_WORKFLOW_NAMES = FORM_WORKFLOW.map((step) => step.name);

export const VTE_LEGACY_NAMES = [
  "تقييم Padua لخطر الجلطات الوريدية والوقاية منها (VTE / Padua RAM)",
  "تقييم Padua لخطر الجلطات الوريدية",
  "نموذج تقييم خطر الجلطات الوريدية VTE (Padua + Caprini) — وش وضهر",
] as const;
