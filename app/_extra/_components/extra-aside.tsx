import Link from "next/link";
import { ArrowUpRight, Gamepad2, Music2, Video } from "lucide-react";

import { MotionBlock } from "@/components/common/motion-primitives";
import { Button } from "@/components/ui/button";

export function ExtraAside() {
  return (
    <aside className="space-y-6">
      <MotionBlock className="border-y border-border/25 py-6">
        <p className="font-sketch text-3xl font-bold text-primary">
          Quick facts
        </p>
        <div className="mt-4 grid gap-3 text-sm font-semibold leading-7">
          <p className="border-b border-border/20 pb-3">
            I can spend too long on one chess position.
          </p>
          <p className="border-b border-border/20 pb-3">
            8 ball is half aim, half mood.
          </p>
          <p>I like music that feels handmade.</p>
        </div>
      </MotionBlock>

      <MotionBlock className="relative overflow-hidden border border-border/25 bg-card/55 p-5">
        <div className="absolute -right-6 -top-6 h-20 w-20 rotate-12 bg-accent" />
        <Music2 className="relative h-5 w-5 text-primary" />
        <h2 className="relative mt-5 text-2xl font-black tracking-[-0.03em]">
          Music corner
        </h2>
        <p className="relative mt-3 text-sm leading-7 text-muted-foreground">
          When the music links are ready, this is where they should live:
          YouTube, TikTok, SoundCloud, or whatever feels honest.
        </p>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-none border-border/35 bg-transparent"
          >
            <Link href="/contact">
              Send a link
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </MotionBlock>

      <MotionBlock className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 border border-border/25 bg-secondary/70 px-3 py-2 text-xs font-black uppercase tracking-[0.12em]">
          <Gamepad2 className="h-4 w-4" />
          games
        </span>
        <span className="inline-flex items-center gap-2 border border-border/25 bg-accent/70 px-3 py-2 text-xs font-black uppercase tracking-[0.12em]">
          <Video className="h-4 w-4" />
          videos
        </span>
      </MotionBlock>
    </aside>
  );
}
