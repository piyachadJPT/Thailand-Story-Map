export const navLinks = [
  { name: "หน้าแรก", href: "/" },
  { name: "สำรวจ", href: "/categories" },
  { name: "สถานที่แนะนำ", href: "/places" },
  { name: "เรื่องราวใหม่", href: "/contribute" },
] as const;

export function isActiveLink(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
