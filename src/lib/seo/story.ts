/** Short titles get "— <category> <province>" so they make sense in search results. */
export function storySeoTitle(story: {
  title: string;
  category: { name: string };
  province: { name: string };
}) {
  const title = story.title.trim();
  return [...title].length < 20 ? `${title} — ${story.category.name} ${story.province.name}` : title;
}

/** Cover alt text: the uploader's alt if it says more than the title, else a descriptive default. */
export function coverAltText(altText: string | null | undefined, title: string, provinceName: string) {
  return altText && altText.trim() && altText.trim() !== title.trim()
    ? altText.trim()
    : `ภาพประกอบเรื่อง ${title} ที่${provinceName}`;
}
