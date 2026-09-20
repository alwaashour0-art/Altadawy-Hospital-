import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { LogoMark } from "@/components/LogoMark";
import { MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "مستشفى التداوي - Altadawy Hospital",
  description: "نظام إدارة النماذج الطبية الإلكترونية - رعاية بلا حدود",
  icons: {
    icon: "/altadawy-logo.jpg",
    shortcut: "/altadawy-logo.jpg",
    apple: "/altadawy-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Header />
        <main className="min-h-[calc(100vh-80px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#084e87] to-[#0d7a65] text-white mt-12 py-10 px-4 no-print">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <LogoMark size={88} />
            <div>
              <div className="font-bold text-lg">مستشفى التداوي</div>
              <div className="text-sm opacity-80">Altadawy Hospital</div>
            </div>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            رعاية بلا حدود — نظام متكامل لإدارة السجلات الطبية الإلكترونية.
          </p>
        </div>
        <div>
          <div className="font-bold mb-3">الاعتمادات</div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-lg border border-white/20">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-[#084e87] font-black text-xs">
              GAHAR
            </div>
            <div className="text-sm">
              <div className="font-semibold">معتمد من GAHAR</div>
              <div className="text-xs opacity-80">هيئة الاعتماد والرقابة الصحية</div>
            </div>
          </div>
        </div>
        <div>
          <div className="font-bold mb-3 text-xl">تواصل معنا</div>
          <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row items-start gap-4">
            <div className="space-y-3 text-sm leading-relaxed flex-1">
              <div className="font-bold text-lg">مستشفى التداوي</div>
              <div className="flex items-start gap-2 text-white/90">
                <MapPin size={18} className="shrink-0 mt-1 text-emerald-200" />
                <span>
                  المطرية، شارع الكابلات، أمام باب حي المطرية
                </span>
              </div>
              <div className="flex items-start gap-2 text-white/95">
                <Phone size={18} className="shrink-0 mt-1 text-emerald-200" />
                <div dir="ltr" className="flex flex-col items-start gap-1 font-mono">
                  <a href="tel:01124122452" className="hover:text-emerald-200 transition">
                    01124122452
                  </a>
                  <a href="tel:01010366468" className="hover:text-emerald-200 transition">
                    01010366468
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-white/20 text-center text-sm opacity-80">
        © {new Date().getFullYear()} مستشفى التداوي. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}


