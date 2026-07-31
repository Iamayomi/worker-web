import Link from "next/link";
import { ArrowUpRight, Code2, ExternalLink } from "lucide-react";

import { MotionItem, MotionList } from "@/components/common/motion-primitives";
import { SkillTags } from "@/components/common/skill-tags";
import { Button } from "@/components/ui/button";
import { normalizeExternalHref } from "@/lib/utils";
import { EmojiCursorArea } from "./emoji-cursor-area";

type SelectedWorksSectionProps = {
  content: ILandingContent["selectedWorks"];
};

export function SelectedWorksSection({ content }: SelectedWorksSectionProps) {
  const featuredBuilds = content.items.length
    ? content.items.map((build, index) => ({
        index: String(index + 1).padStart(3, "0"),
        name: build.title,
        category: build.category,
        description: build.summary || "",
        stack: build.stack || [],
        githubHref: normalizeExternalHref(build.githubUrl),
        liveHref: normalizeExternalHref(build.liveUrl),
      }))
    : [];

  if (!featuredBuilds.length) return null;

  return (
    <EmojiCursorArea>
      <div className="flex items-end justify-between gap-4 border-b border-border/20 pb-3">
        <div>
          <p className="font-sketch text-3xl font-bold text-primary">
            {content.eyebrow}
          </p>
          <h2 className="text-2xl font-black tracking-[-0.03em]">
            {content.title}
          </h2>
        </div>
        <Link
          href={content.linkHref}
          className="inline-flex items-center gap-1 text-sm font-bold shrink-0"
        >
          {content.linkLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <MotionList className="divide-y divide-border/20">
        {featuredBuilds.map((build) => (
          <MotionItem
            key={build.index}
            className="group py-6 transition-colors hover:bg-accent/20"
          >
            <div className="grid gap-4 sm:grid-cols-[5rem_minmax(0,1fr)]">
              <p className="font-sketch text-3xl font-bold text-primary transition-transform group-hover:-rotate-3">
                {build.index}
              </p>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                  {build.category}
                </p>
                <h3 className="mt-2 text-xl font-black tracking-[-0.02em]">
                  {build.name}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {build.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {build.githubHref ? (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-none border-border/35 bg-transparent"
                    >
                      <a
                        href={build.githubHref}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-umami-event="project_github_clicked"
                        data-umami-event-project={build.name}
                      >
                        GitHub
                        <Code2 className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : null}
                  {build.liveHref ? (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-none bg-foreground text-background hover:bg-foreground/85"
                    >
                      <a
                        href={build.liveHref}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-umami-event="project_live_view_clicked"
                        data-umami-event-project={build.liveHref}
                      >
                        View
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : null}
                </div>
                <div className="mt-4">
                  <SkillTags items={build.stack} />
                </div>
              </div>
            </div>
          </MotionItem>
        ))}
      </MotionList>
    </EmojiCursorArea>
  );
}
