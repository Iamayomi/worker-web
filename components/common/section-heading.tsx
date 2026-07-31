import type { LucideIcon } from "lucide-react";
import { TiPin } from "react-icons/ti";

type SectionHeadingProps = {
  eyebrow: string;
  heading: string;
  description?: string;
  icon?: LucideIcon;
  tag?: string;
};

export function SectionHeading({
  eyebrow,
  heading,
  description,
  icon: Icon,
  tag,
}: SectionHeadingProps) {
  return (
    <header className="relative border-b border-border/20 pb-8">
      <span
        aria-hidden="true"
        className="absolute right-0 top-1 hidden rotate-3 border border-border/30 bg-accent px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-accent-foreground sm:block"
      >
        <TiPin className="absolute -left-1 -top-3 h-5 w-5 rotate-12 fill-red-500 text-red-500" />
        {tag ?? "note"}
      </span>
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
        <span>{eyebrow}</span>
      </div>
      <h1 className="mt-4 max-w-4xl text-3xl sm:text-4xl font-black leading-[0.98] tracking-[-0.04em] text-foreground">
        {heading}
      </h1>
      {description ? (
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}
