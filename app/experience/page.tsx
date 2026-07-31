import type { Metadata } from "next";

import { PageShell } from "@/components/common/page-shell";
import { SectionHeading } from "@/components/common/section-heading";
import { getExperienceContent } from "@/lib/api/pages";
import {
  experience,
  pageIntros,
  // profile,
} from "@/lib/fallbacks/portfolio-data";
import type {
  ExperienceItem,
  ExperiencePageContent,
} from "@/lib/types/experience";
import { ExperienceTimeline } from "./_components/experience-timeline";
import { OperatingNote } from "./_components/operating-note";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Backend engineering experience building scalable systems for healthcare, logistics, and non-profit organizations.",
  alternates: {
    canonical: "/experience",
  },
};

export const revalidate = 900;

export default async function ExperiencePage() {
  const response = await getExperienceContent();
  const content = response?.data;
  const intro = content?.hero
    ? {
        ...pageIntros.experience,
        eyebrow: content.hero.eyebrow,
        heading: content.hero.title,
        description: content.hero.description,
      }
    : pageIntros.experience;

  const items: ExperienceItem[] = content?.items?.length
    ? content.items.map(
        (item: ExperiencePageContent["items"][number], index) => ({
          index: String(index + 1).padStart(2, "0"),
          period: item.period,
          role: item.role,
          websiteUrl: item.websiteUrl || undefined,
          summary: item.summary || "",
          signals: item.signals || [],
        })
      )
    : experience;
  const operatingNote = content?.hero.operatingNote;

  return (
    <PageShell>
      <SectionHeading {...intro} tag="XP" />
      <ExperienceTimeline items={items} />
      <OperatingNote note={operatingNote} />
    </PageShell>
  );
}
