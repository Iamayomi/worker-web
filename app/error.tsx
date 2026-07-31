"use client";

import { RefreshCcw } from "lucide-react";

import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <PageShell>
      <section className="max-w-2xl border-y border-border/20 py-16">
        <p className="font-sketch text-5xl font-bold text-primary">
          Rough page
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em]">
          Something broke while opening this note.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Try again. If it keeps happening, the CMS may be unreachable.
        </p>
        <Button type="button" onClick={reset} className="mt-6">
          <RefreshCcw className="h-4 w-4" />
          Try again
        </Button>
      </section>
    </PageShell>
  );
}
