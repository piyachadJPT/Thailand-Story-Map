import { createLucideIcon } from "lucide-react";

/*
 * Custom icon set drawn for the site: Thai motifs, 24×24, stroke-only,
 * round caps. Built with createLucideIcon so they take the same props
 * (size, strokeWidth, className) as the lucide icons used elsewhere.
 */

/** เรื่องลี้ลับ: spirit house (ศาลพระภูมิ) on its post. */
export const SpiritHouse = createLucideIcon("spirit-house", [
  ["path", { d: "M12 2v2.5", key: "finial" }],
  ["path", { d: "M3.5 9.5 4.5 10.5 12 4.5l7.5 6 1-1", key: "roof" }],
  ["path", { d: "M7 9v5.5h10V9", key: "body" }],
  ["path", { d: "M10.75 14.5v-3h2.5v3", key: "door" }],
  ["path", { d: "M5.5 14.5h13", key: "deck" }],
  ["path", { d: "M12 14.5V21", key: "post" }],
  ["path", { d: "M9 21h6", key: "base" }],
]);

/** ประวัติศาสตร์: bell-shaped chedi on a stepped base. */
export const Chedi = createLucideIcon("chedi", [
  ["path", { d: "M12 2v3.5", key: "spire" }],
  ["path", { d: "M10.5 5.5h3", key: "ring" }],
  ["path", { d: "M7.5 15c0-3.6 2-6.3 4.5-7.5 2.5 1.2 4.5 3.9 4.5 7.5", key: "bell" }],
  ["path", { d: "M6 15h12", key: "plinth" }],
  ["path", { d: "M7 15v3h10v-3", key: "step" }],
  ["path", { d: "M5 18v3h14v-3", key: "base" }],
]);

/** ตำนาน: oil lamp (ประทีป), for tales told by lamplight. */
export const OilLamp = createLucideIcon("oil-lamp", [
  ["path", { d: "M12 3c1.6 1.8 2 3.2 2 4.2a2 2 0 0 1-4 0c0-1 .4-2.4 2-4.2Z", key: "flame" }],
  ["path", { d: "M12 11.5V13", key: "wick" }],
  ["path", { d: "M5 13h14l-2 4H7Z", key: "bowl" }],
  ["path", { d: "M12 17v4M10 21h4", key: "stand" }],
]);

/** อาชญากรรม: kris dagger (กริช) with a wavy blade. */
export const Kris = createLucideIcon("kris", [
  ["path", { d: "M9.5 4.5c.8-1.8 4-2 4.5-.3", key: "pommel" }],
  ["path", { d: "M12 3.5v4", key: "grip" }],
  ["path", { d: "M8 8.5c2.6-1.2 5.4-1.2 8 0", key: "guard" }],
  ["path", { d: "M10.5 9c.6 1.6-.6 2.6 0 4.2s-.6 2.6 0 4.2L12 21.5", key: "blade-left" }],
  ["path", { d: "M13.5 9c.6 1.6-.6 2.6 0 4.2s-.6 2.6 0 4.2L12 21.5", key: "blade-right" }],
]);

/** เรื่องเล่าท้องถิ่น: Thai stilt house (เรือนไทย) with a steep gable. */
export const ThaiHouse = createLucideIcon("thai-house", [
  ["path", { d: "M3.5 12 5 11l7-8.5 7 8.5 1.5 1", key: "roof" }],
  ["path", { d: "M7 11l.5 6h9l.5-6", key: "walls" }],
  ["path", { d: "M10.75 17v-3.5h2.5V17", key: "door" }],
  ["path", { d: "M5 17h14", key: "floor" }],
  ["path", { d: "M8 17v4M16 17v4", key: "stilts" }],
]);

/** Searched place: a ringed point. */
export const PlaceMark = createLucideIcon("place-mark", [
  ["circle", { cx: "12", cy: "12", r: "3", fill: "currentColor", key: "point" }],
  ["circle", { cx: "12", cy: "12", r: "7.5", key: "ring" }],
]);

/** Story being written: pen nib. */
export const PenNib = createLucideIcon("pen-nib", [
  ["path", { d: "M12 2.5 6.5 10 12 21.5 17.5 10Z", key: "nib" }],
  ["path", { d: "M12 21.5V13", key: "slit" }],
  ["circle", { cx: "12", cy: "11", r: "1.5", key: "hole" }],
]);
