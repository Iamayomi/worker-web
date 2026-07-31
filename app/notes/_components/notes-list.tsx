import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { MotionItem, MotionList } from "@/components/common/motion-primitives";
import { Badge } from "@/components/ui/badge";
import type { PublicNoteListItem } from "@/lib/types/notes";

type NotesListProps = {
  notes: PublicNoteListItem[];
  page: number;
};

const formatNoteDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Unpublished";

export function NotesList({ notes, page }: NotesListProps) {
  return (
    <MotionList className="mt-8 divide-y divide-border/30">
      {notes.map((note, itemIndex) => (
        <MotionItem
          key={note.id || note.slug}
          className="group grid gap-4 py-6 transition-colors hover:bg-secondary/25 first:pt-0 md:grid-cols-[6rem_minmax(0,1fr)_9rem]"
        >
          <div>
            <p className="font-sketch text-3xl font-bold text-primary transition-transform group-hover:-rotate-3">
              {String((page - 1) * 10 + itemIndex + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {formatNoteDate(note.publishedAt)}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/notes/${note.slug}`} className="group/title">
                <h2 className="text-2xl font-extrabold transition-colors group-hover/title:text-primary">
                  {note.title}
                </h2>
              </Link>
              {note.tags?.[0] ? (
                <Badge
                  variant="outline"
                  className="rounded-none bg-background/60"
                >
                  {note.tags[0]}
                </Badge>
              ) : null}
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              {note.excerpt}
            </p>
            <Link
              href={`/notes/${note.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Read note
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <Link
            href={`/notes/${note.slug}`}
            className="relative aspect-square overflow-hidden border border-border/25 bg-accent/45 md:ml-auto md:w-32"
            aria-label={`Read ${note.title}`}
          >
            {note.bannerImage ? (
              <Image
                src={note.bannerImage}
                alt={note.title}
                fill
                sizes="128px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center font-sketch text-2xl font-bold text-primary">
                note
              </div>
            )}
          </Link>
        </MotionItem>
      ))}
    </MotionList>
  );
}
