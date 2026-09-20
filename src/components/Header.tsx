"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/LogoMark";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <LogoMark size={68} />
          <div className="leading-tight">
            <div className="font-bold text-[#084e87] text-lg">مستشفى التداوي</div>
            <div className="text-[10px] text-emerald-700 font-semibold">رعاية بلا حدود — النماذج الطبية</div>
          </div>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative hidden sm:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="بحث عام: اسم مريض، رقم ملف، طبيب، تشخيص..."
            className="input pr-10"
          />
        </form>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#084e87] hover:bg-blue-50"
          >
            الرئيسية (النماذج)
          </Link>
        </div>
      </div>
    </header>
  );
}
