import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import WriteStoryButton from "@/components/share/global/navbar/WriteStoryButton";

/**
 * "ร่วมเล่า" call to action. The write button opens the composer when signed
 * in, or goes to login first — the same rule as the navbar button.
 */
export default function ContributeCta() {
  return (
    <GlassPanel
      as="section"
      surface="solid"
      gilded
      padding="lg"
      className="flex flex-col items-start gap-6 overflow-hidden sm:flex-row sm:items-center sm:justify-between"
    >
      <SectionHeading
        eyebrow="ร่วมเล่า"
        title="มีเรื่องเล่าในพื้นที่ของคุณไหม?"
        className="gap-2"
      />
      <div className="flex flex-wrap items-center gap-3">
        <WriteStoryButton isHome={false} className="h-12 shadow-soft" />
        <Link href="/" prefetch={false} className={buttonVariants({ variant: "outline", size: "lg" })}>
          กลับไปที่แผนที่
        </Link>
      </div>
    </GlassPanel>
  );
}
