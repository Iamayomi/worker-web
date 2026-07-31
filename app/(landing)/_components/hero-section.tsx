import Link from "next/link";
import { Boxes, Mail } from "lucide-react";

import { MotionBlock } from "@/components/common/motion-primitives";
import { Button } from "@/components/ui/button";
import { HeroPortraitCursor } from "./hero-portrait-cursor";

type HeroSectionProps = {
  content: ILandingContent["hero"];
};

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <div className="border-b border-border/25">
      <div className="relative z-10 grid gap-y-10 gap-x-1 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <HeroPortraitCursor imageUrl={content.portraitImageUrl}>
          <MotionBlock className="py-8 sm:py-12">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {content.pageLabel}
            </p>
            <p className="font-sketch text-3xl font-bold text-primary">
              {content.greeting}
            </p>
            <h1 className="mt-4 max-w-4xl text-balance text-3xl sm:text-4xl font-black leading-[0.95] tracking-[-0.06em] text-foreground">
              {content.headline}
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {content.intro}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {content.primaryCta.published !== false ? (
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-none bg-foreground px-5 text-background hover:bg-foreground/85"
                >
                  <Link href={content.primaryCta.href}>
                    {content.primaryCta.label}
                    <Boxes className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              {content.secondaryCta.published !== false ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-none border-border/40 bg-transparent px-5"
                >
                  <Link href={content.secondaryCta.href}>
                    {content.secondaryCta.label}
                    <Mail className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </MotionBlock>
        </HeroPortraitCursor>
        <MotionBlock className="border-t lg:border-t-0 py-8 sm:py-12">
          <div className="lg:pl-6 border-border/25 lg:border-l">
            <p className="font-sketch text-3xl font-bold text-primary">
              Side notes
            </p>
            <div className="mt-4 space-y-5">
              {content.snapshots.map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </MotionBlock>
      </div>
    </div>
  );
}
