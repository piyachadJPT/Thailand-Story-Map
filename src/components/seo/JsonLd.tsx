import { serializeJsonLd } from "@/lib/seo/jsonld";

/** Structured data for search engines; the payload is escaped against </script>. */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Escaped by serializeJsonLd: <, > and & cannot close the script tag.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
