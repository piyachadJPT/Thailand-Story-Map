import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import type { Crumb } from "@/lib/seo/jsonld";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  crumbs: Crumb[];
  sections: LegalSection[];
  /** Table of contents beside the text on wide screens. */
  toc?: boolean;
  jsonLd?: unknown;
};

/** Long-form reading page: ~68ch text column, optional sticky contents list. */
/** Date shown as "ปรับปรุงล่าสุด" on about, privacy and terms. Update it with the text. */
export const LEGAL_UPDATED = { iso: "2026-11-03", label: "3 พฤศจิกายน 2569" };

export default function LegalPage({ eyebrow, title, description, crumbs, sections, toc = false, jsonLd }: LegalPageProps) {
  return (
    <PageContainer width="wide">
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <Breadcrumbs items={crumbs} className="mb-6" />
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <div className={toc ? "lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12" : undefined}>
        {toc ? (
          <nav aria-label="สารบัญ" className="mb-10 lg:mb-0">
            <div className="rounded-2xl border border-border bg-card/60 p-5 lg:sticky lg:top-28">
              <p className="text-xs font-medium tracking-widest text-gold-ink">สารบัญ</p>
              <ol className="mt-3 space-y-2 text-sm">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        ) : null}
        <div className="max-w-[68ch] space-y-10 leading-relaxed text-foreground">
          {sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28 space-y-3">
              <h2 id={`${section.id}-title`} className="font-heading text-2xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-3 text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-foreground [&_a]:text-gold-ink [&_a]:underline [&_a]:underline-offset-4">
                {section.body}
              </div>
            </section>
          ))}
          <p className="border-t border-border pt-6 text-sm text-muted-foreground">
            ปรับปรุงล่าสุด <time dateTime={LEGAL_UPDATED.iso}>{LEGAL_UPDATED.label}</time>
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
