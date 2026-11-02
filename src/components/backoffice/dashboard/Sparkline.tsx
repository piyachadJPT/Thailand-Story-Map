/** Tiny trend line (decorative; the card states the number). */
export default function Sparkline({ values, color = "var(--gold)" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const width = 120;
  const height = 32;
  const max = Math.max(1, ...values);
  const step = width / (values.length - 1);
  const points = values.map((value, index) => [index * step, height - 2 - (value / max) * (height - 4)] as const);
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-8 w-full">
      <path d={`${line} L${width} ${height} L0 ${height} Z`} fill={color} opacity={0.12} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.75} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
