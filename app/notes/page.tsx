import type { Metadata } from "next";

import { Pagination } from "@/components/common/pagination";
import { PageShell } from "@/components/common/page-shell";
import { SectionHeading } from "@/components/common/section-heading";
import { getNotesContent } from "@/lib/api/pages";
import { NotesList } from "./_components/notes-list";
import { NotesSearch } from "./_components/notes-search";
import { NotesEmptyState } from "./_components/notes-empty-state";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Explore some of my technical notes on fullstack engineering, smart contract development, and security review.",
  alternates: {
    canonical: "/notes",
  },
};

type NotesPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    limit?: string;
  }>;
};

const NOTE_LIMIT = 10;

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = await searchParams;
  const page = Math.max(Number(params.page || 1), 1);
  const q = params.q?.trim() || "";
  const limit = Number(params?.limit) || NOTE_LIMIT;

  const response = await getNotesContent({ page, q, limit });
  const content = response?.data;
  const pagination = response?.pagination;

  return (
    <PageShell>
      <SectionHeading
        eyebrow={content?.hero.eyebrow || "Research notes"}
        heading={
          content?.hero.title || "A quiet archive for technical writing."
        }
        description={content?.hero.description}
        tag="NOTE"
      />
      <NotesSearch defaultValue={q} />
      {content?.notes?.length ? (
        <>
          <NotesList notes={content.notes} page={pagination?.page || page} />
          <Pagination
            pathname="/notes"
            searchParams={{ ...(q ? { q } : {}) }}
            currentPage={pagination?.page || page}
            totalPages={pagination?.totalPages || 1}
            showingStart={pagination?.showingStart || 0}
            showingEnd={pagination?.showingEnd || 0}
            totalItems={pagination?.total || 0}
            itemName="notes"
            limit={pagination?.limit || 10}
          />
        </>
      ) : (
        <NotesEmptyState />
      )}
    </PageShell>
  );
}
