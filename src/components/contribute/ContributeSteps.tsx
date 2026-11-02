import { MapPin, PenLine, Share2 } from "lucide-react";
import StepCard from "./StepCard";

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

/** ปักหมุดสถานที่ → เล่าเรื่อง → แชร์ให้คนอื่นเดินทางต่อ, joined by a gold line. */
export default function ContributeSteps() {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute inset-x-1/6 top-12 hidden h-px bg-linear-to-r from-gold/0 via-gold/60 to-gold/0 md:block"
      />
      <ol className="relative grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title}>
            <StepCard step={index + 1} icon={step.icon} title={step.title} body={step.body} />
          </li>
        ))}
      </ol>
    </div>
  );
}
