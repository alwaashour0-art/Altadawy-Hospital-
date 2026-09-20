"use client";
import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function FillRedirect() {
  const params = useParams();
  const router = useRouter();
  const sp = useSearchParams();
  const templateId = params.templateId;
  const patientId = sp.get("patientId");

  useEffect(() => {
    const target = patientId
      ? `/forms/${templateId}?patientId=${patientId}`
      : `/forms/${templateId}`;
    router.replace(target);
  }, [templateId, patientId, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
      جاري تحميل النموذج...
    </div>
  );
}
