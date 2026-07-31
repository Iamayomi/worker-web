import { PageShell } from "@/components/common/page-shell";
import { HeroSection } from "./_components/hero-section";
import { LandingAside } from "./_components/landing-aside";
import { RecentNotesSection } from "./_components/recent-notes-section";
import { SelectedWorksSection } from "./_components/selected-works-section";
import { getLandingContent } from "@/lib/api/pages";
import { fallbackLandingContent } from "@/lib/fallbacks";

export const revalidate = 900;

export default async function HomePage() {
  const data = (await getLandingContent())?.data ?? fallbackLandingContent;

  return (
    <PageShell className="cursor-default py-10 sm:py-16">
      <HeroSection content={data.hero} />

      <section className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-12">
          <SelectedWorksSection content={data.selectedWorks} />
          <RecentNotesSection content={data.selectedNotes} />
        </div>
        <LandingAside content={data.aside} />
      </section>
    </PageShell>
  );
}
