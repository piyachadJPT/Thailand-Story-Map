import Link from "next/link";
import { MapPin, PenLine, Share2 } from "lucide-react";
import PageHero from "@/components/layout/PageHero";

const steps = [
  {
    icon: MapPin,
    title: "ปักหมุดสถานที่",
    body: "เลือกพิกัดบนแผนที่ที่เรื่องนั้นผูกอยู่ — วัด ซอย ป่า หรือเมืองเก่า",
  },
  {
    icon: PenLine,
    title: "เล่าเรื่อง",
    body: "เขียนสรุปสั้น ๆ แล้วขยายเป็นเรื่องเต็ม พร้อมหมวดและจังหวัด",
  },
  {
    icon: Share2,
    title: "แชร์ให้คนอื่นเดินทางต่อ",
    body: "เมื่อเผยแพร่แล้ว คนอื่นสามารถบินไปยังจุดนั้นบนแผนที่ได้ทันที",
  },
];

export default function ContactPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <PageHero
          eyebrow="ร่วมเล่า"
          title="เรื่องราวใหม่"
          description="ทุกจุดบนแผนที่มีเรื่องซ่อนอยู่ ส่งเรื่องของคุณให้คนอื่นได้เดินทางผ่านตำนาน ประวัติศาสตร์ และเรื่องใกล้ตัว"
        />

        <ol className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="glass-card flex gap-4 rounded-[1.4rem] p-4 sm:p-5"
              >
                <span className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-primary text-[0.68rem] font-semibold tracking-[0.18em] uppercase">
                    ขั้นตอนที่ {index + 1}
                  </p>
                  <h2 className="font-heading text-foreground mt-1 text-lg font-semibold">
                    {step.title}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/login"
            className="bg-foreground text-background inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold shadow-sm transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            เข้าสู่ระบบเพื่อเล่าเรื่อง
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex h-11 items-center rounded-full px-4 text-sm font-medium transition-colors"
          >
            กลับไปที่แผนที่
          </Link>
        </div>
      </div>
    </>
  );
}
