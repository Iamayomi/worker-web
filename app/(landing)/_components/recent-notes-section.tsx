import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MotionItem, MotionList } from "@/components/common/motion-primitives";
import { EmojiCursorArea } from "./emoji-cursor-area";
import { NotesEmptyState } from "@/app/notes/_components/notes-empty-state";

type RecentNotesSectionProps = {
  content: ILandingContent["selectedNotes"];
};

export function RecentNotesSection({ content }: RecentNotesSectionProps) {
  const featuredNotes = content.items.length
    ? content.items.map((note, index) => ({
        index: String(index + 1).padStart(2, "0"),
        slug: note.slug,
        title: note.title,
        date: note.publishedAt ? formatShortDate(note.publishedAt) : "Recent",
        readTime: note.readTime,
        status: "published",
        excerpt: note.excerpt || "",
        primaryTag: note.tags[0] || "Article",
      }))
    : [];

  if (!featuredNotes.length) return <NotesEmptyState />;

  return (
    <EmojiCursorArea item="📝">
      <div className="flex items-end justify-between gap-4 border-b border-border/20 py-3">
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
        {featuredNotes.map((note) => (
          <MotionItem
            key={note.slug}
            className="group py-6 transition-colors hover:bg-secondary/30"
          >
            <div className="grid gap-4 sm:grid-cols-[4rem_minmax(0,1fr)]">
              <p className="font-sketch text-3xl font-bold text-primary transition-transform group-hover:-rotate-6">
                {note.index}
              </p>
              <div className="flex gap-2 flex-nowrap">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                      {note.date}
                    </p>
                    <span className="border border-border/25 bg-accent/65 px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em]">
                      {note.primaryTag}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-black tracking-[-0.02em]">
                    {note.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground line-clamp-1">
                    {note.excerpt}
                  </p>
                  <Link
                    href={`/notes/${note.slug}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Read note
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </MotionItem>
        ))}
      </MotionList>
    </EmojiCursorArea>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
