import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-6xl px-8 py-8 sm:px-12 lg:px-16",
        className
      )}
    >
      {children}
    </main>
  );
}
