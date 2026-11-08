type ResultGroupProps = {
  title: string;
  count: string;
  children: React.ReactNode;
};

/** A titled list of results ("สถานที่", "เรื่องราว"). */
export default function ResultGroup({ title, count, children }: ResultGroupProps) {
  return (
    <section aria-label={title}>
      <h3 className="flex items-center gap-2 px-1 pb-2 font-sans text-sm font-semibold text-chad">
        <span aria-hidden="true" className="lai-prajamyam w-3.5" />
        {title}
        <span className="font-normal text-muted-foreground">
          · {count}
        </span>
      </h3>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}
