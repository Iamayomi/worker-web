import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  href?: string;
  /** Extra detail rendered below the main value (e.g. expanded "View more"). */
  extra?: ReactNode;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  extra,
}: StatCardProps) {
  const content = (
    <div>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      {extra && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/15 pt-3 text-xs text-muted-foreground">
          {extra}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn("block rounded-lg border border-border/15 p-5 transition-colors hover:border-border/30")}
      >
        {content}
      </Link>
    );
  }

  return <div className="rounded-lg border border-border/15 p-5">{content}</div>;
}
