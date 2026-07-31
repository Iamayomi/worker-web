import { MotionItem, MotionList } from "@/components/common/motion-primitives";
import { extraItems } from "@/lib/fallbacks/portfolio-data";

export function ExtraGrid() {
  return (
    <MotionList className="grid gap-4 sm:grid-cols-2">
      {extraItems.map((item, index) => (
        <MotionItem
          key={item.title}
          className={`${item.color} group min-h-52 border border-border/25 p-5 transition-transform hover:-rotate-1`}
        >
          <div className="flex items-start justify-between gap-4">
            <p className="font-sketch text-4xl font-bold text-primary">
              {String(index + 1).padStart(2, "0")}
            </p>
            <span className="rotate-6 border border-border/30 bg-background/50 px-2 py-1 text-xs font-black uppercase tracking-[0.14em]">
              off clock
            </span>
          </div>
          <h2 className="mt-8 text-3xl font-black tracking-[-0.04em]">
            {item.title}
          </h2>
          <p className="mt-4 text-sm font-semibold leading-7 text-foreground/80">
            {item.note}
          </p>
        </MotionItem>
      ))}
    </MotionList>
  );
}
