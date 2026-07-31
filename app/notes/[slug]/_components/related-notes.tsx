import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { PublicNoteListItem } from "@/lib/types/notes";

type RelatedNotesProps = {
  notes: PublicNoteListItem[];
};

export function RelatedNotes({ notes }: RelatedNotesProps) {
  if (!notes.length) return null;

  return (
    <section className="border-t border-border/20 pt-10 mb-10">
      <p className="font-sketch text-3xl font-bold text-primary">
        Related notes
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {notes.map((note) => (
          <Link
            key={note.id || note.slug}
            href={`/notes/${note.slug}`}
            className="group border border-border/25 bg-card/45 p-4 transition-colors hover:bg-secondary/25"
          >
            <h3 className="mt-3 text-lg font-black leading-tight group-hover:text-primary">
              {note.title}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {note.excerpt}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
              Read / {note.readTime}
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
