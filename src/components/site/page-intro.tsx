import { cn } from "@/lib/cn";

/** Big editorial page header: small pill, huge title, optional aside text (Photo Gallery-style). */
export function PageIntro({
  eyebrow,
  title,
  aside,
  className,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-[1320px] px-4 pt-10 sm:px-6 sm:pt-16 lg:px-10",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink-2 shadow-soft">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-display font-semibold text-balance-safe">{title}</h1>
        {aside ? (
          <div className="max-w-xs text-sm text-ink-2 md:pb-2 md:text-right">{aside}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
