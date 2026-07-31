import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-[#b9ebf5] text-foreground",
        muted: "border-border bg-[#eee8ff] text-foreground",
        outline: "border-border bg-transparent text-foreground",
        warning:
          "border-amber-400/30 bg-amber-400/10 text-amber-200 dark:text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
