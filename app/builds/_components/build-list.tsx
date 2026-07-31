import { Code2, ExternalLink } from "lucide-react";

import { MotionItem, MotionList } from "@/components/common/motion-primitives";
import { SkillTags } from "@/components/common/skill-tags";
import { Button } from "@/components/ui/button";
import type { BuildItem } from "@/lib/types/experience";

export function BuildList({ items }: { items: BuildItem[] }) {
  return (
    <MotionList className="mt-10 border-y border-border/25">
      {items.map((build) => (
        <MotionItem
          key={build.index}
          className="group grid gap-5 border-b border-border/20 py-8 transition-colors hover:bg-accent/20 last:border-b-0 md:grid-cols-[8rem_minmax(0,1fr)_14rem]"
        >
          <div>
            <span className="font-sketch text-4xl font-bold text-primary transition-transform group-hover:-rotate-3">
              {build.index}
            </span>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
              {build.status.replace("-", " ")}
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
              {build.category}
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.04em]">
              {build.name}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              {build.description}
            </p>
            <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-foreground/85">
              {build.proof}
            </p>
            <div className="mt-5 md:hidden">
              <SkillTags items={build.stack} />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="hidden md:block">
              <SkillTags items={build.stack} />
            </div>
            <div className="flex flex-wrap gap-2 md:flex-col">
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
                    View project
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              ) : null}
            </div>
          </aside>
        </MotionItem>
      ))}
    </MotionList>
  );
}
