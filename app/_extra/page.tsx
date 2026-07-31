import type { Metadata } from "next";

import { PageShell } from "@/components/common/page-shell";
import { SectionHeading } from "@/components/common/section-heading";
import { pageIntros } from "@/lib/fallbacks/portfolio-data";
import { ExtraAside } from "./_components/extra-aside";
import { ExtraGrid } from "./_components/extra-grid";

export const metadata: Metadata = {
  title: "Extra",
  description:
    "A playful page about Somto outside work: chess, 8 ball, music, games, and personal corners.",
  alternates: {
    canonical: "/extra",
  },
};

export default function ExtraPage() {
  return (
    <PageShell>
      <SectionHeading {...pageIntros.extra} tag="PLAY" />
      <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ExtraGrid />
        <ExtraAside />
      </section>
    </PageShell>
  );
}
