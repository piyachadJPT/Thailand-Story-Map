import { Compass, Landmark, Sparkles } from "lucide-react";
import PageHero from "@/components/layout/PageHero";

const highlights = [
  {
    icon: Sparkles,
    title: "คัดจากชุมชน",
    body: "จุดที่คนอ่านกลับไปบ่อย เรื่องที่ถูกเล่าต่อ และสถานที่ที่ยังมีชีวิต",
  },
  {
    icon: Landmark,
    title: "มรดกและความทรงจำ",
    body: "วัด เมืองเก่า อนุสาวรีย์ และพื้นที่ที่ประวัติศาสตร์ยังเกาะอยู่",
  },
  {
    icon: Compass,
    title: "เส้นทางสำรวจ",
    body: "ชุดพิกัดที่เดินทางต่อกันได้ — จากลี้ลับ สู่ตำนาน แล้วลงที่เรื่องท้องถิ่น",
  },
];

export default function RecommendedPlacesPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <PageHero
          eyebrow="คัดสรร"
          title="สถานที่แนะนำ"
          description="จุดที่น่าเดินทางผ่านเรื่องเล่า — จะทยอยอัปเดตจากเรื่องที่เผยแพร่บนแผนที่"
        />

        <ul className="grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="glass-card rounded-[1.4rem] p-5">
                <span className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-heading text-foreground text-base font-semibold">
                  {item.title}
                </h2>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {item.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
