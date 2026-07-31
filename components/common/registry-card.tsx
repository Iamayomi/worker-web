import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { StatusBadge } from "./status-badge";

type RegistryCardProps = {
  index: string;
  title: string;
  meta?: string;
  status?: string;
  children: ReactNode;
  className?: string;
};

export function RegistryCard({
  index,
  title,
  meta,
  status,
  children,
  className,
}: RegistryCardProps) {
  return (
    <Card className={cn("overflow-hidden rounded-xl border border-border/70 bg-white/82 shadow-sm", className)}>
      <CardHeader className="gap-3 border-b border-border/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="shrink-0 font-sketch text-xl font-bold text-primary">
            #{index}
          </span>
          <CardTitle className="min-w-0 text-base font-extrabold leading-snug sm:text-lg">
            {title}
          </CardTitle>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {meta ? (
            <span className="hidden text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground sm:inline">
              {meta}
            </span>
          ) : null}
          {status ? <StatusBadge status={status} /> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
