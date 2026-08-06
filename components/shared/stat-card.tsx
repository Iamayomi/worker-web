import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  href?: string;
}

export function StatCard({ label, value, icon: Icon, href }: StatCardProps) {
  const content = (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
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
