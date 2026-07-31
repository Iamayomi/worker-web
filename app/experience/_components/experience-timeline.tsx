import { Check } from "lucide-react";

import { MotionItem, MotionList } from "@/components/common/motion-primitives";
import { ExperienceItem } from "@/lib/types/experience";

export function ExperienceTimeline({ items }: { items: ExperienceItem[] }) {
  return (
    <MotionList className="mt-8 grid gap-6">
      {items.map((item) => (
        <MotionItem
          key={item.index}
          className="group grid gap-4 border-b border-border/30 pb-6 transition-colors hover:bg-secondary/25 last:border-b-0 md:grid-cols-[9rem_minmax(0,1fr)]"
        >
          <div>
            <p className="font-sketch text-3xl font-bold text-primary transition-transform group-hover:-rotate-3">
              {item.index}
            </p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
              {item.period}
            </p>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold">{item.role}</h2>
            </div>
            {item.websiteUrl ? (
              <a
                href={item.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-flex text-xs font-bold text-primary underline underline-offset-4"
              >
                {item.websiteUrl}
              </a>
            ) : null}
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              {item.summary}
            </p>

            {item.signals.length ? (
              <ul className="mt-5">
                {item.signals.map((signal) => (
                  <li
                    key={signal}
                    className="flex gap-3 text-sm leading-6 text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </MotionItem>
      ))}
    </MotionList>
  );
}
