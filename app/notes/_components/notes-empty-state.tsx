import { NotebookPen } from "lucide-react";

export function NotesEmptyState() {
  return (
    <section className="mt-8 border border-border/25 bg-card/45 p-6 sm:p-8">
      <NotebookPen className="h-6 w-6 text-primary" />
      <h2 className="mt-4 text-2xl font-black">No published notes yet.</h2>
      <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
        The archive is quiet for now. When a note is published, it will show up
        here.
      </p>
    </section>
  );
}
