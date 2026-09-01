"use client";

import { cn } from "@/lib/utils";

export function UnreadDot({
 show,
 className,
}: {
 show: boolean;
 className?: string;
}) {
 if (!show) return null;
 return (
 <span
 className={cn(
 "absolute size-2.5 bg-destructive ring-2 ring-background",
 className
 )}
 />
 );
}
