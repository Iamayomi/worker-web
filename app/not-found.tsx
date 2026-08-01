import Link from "next/link";

import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <section className="max-w-2xl border-y border-border/20 py-16">
        <p className="text-5xl font-bold text-primary">Page not found</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">
          This page does not exist.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          The link may be old, moved, or never existed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go home</Link>
        </Button>
      </section>
    </PageShell>
  );
}

