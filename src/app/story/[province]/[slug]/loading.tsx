export default function LoadingStory() {
  return (
    <>
      <div
        className="mx-auto w-full max-w-6xl space-y-6 px-[18px] py-6 sm:py-8"
        role="status"
        aria-label="กำลังโหลดเรื่องราว"
      >
        <div className="bg-foreground/10 h-5 w-40 animate-pulse rounded-full" />
        <div className="bg-foreground/10 h-12 w-3/4 animate-pulse rounded-2xl" />
        <div className="bg-foreground/5 h-24 animate-pulse rounded-2xl" />
        <div className="glass-card space-y-4 rounded-[1.6rem] p-8">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="bg-foreground/10 h-4 animate-pulse rounded-full"
            />
          ))}
        </div>
        <span className="sr-only">กำลังโหลดเรื่องราว…</span>
      </div>
    </>
  );
}
