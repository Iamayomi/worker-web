import Link from "next/link";

import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <section className="max-w-2xl border-y border-border/20 py-16">
        <p className="font-sketch text-5xl font-bold text-primary">Lost page</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">
          This page is not in the notebook.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          The link may be old, moved, or still waiting to be written.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go home</Link>
        </Button>
      </section>
    </PageShell>
  );
}
