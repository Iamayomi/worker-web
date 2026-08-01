import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  pathname: string;
  searchParams?: Record<string, string>;
  currentPage: number;
  totalPages: number;
  showingStart: number;
  showingEnd: number;
  totalResults: number;
  itemLabel?: string;
}

function buildHref(
  pathname: string,
  searchParams: Record<string, string> | undefined,
  page: number
) {
  const params = new URLSearchParams(searchParams ?? {});
  params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages: (number | "...")[] = [];
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("...");
  }
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }
  return pages;
}

export function Pagination({
  pathname,
  searchParams,
  currentPage,
  totalPages,
  showingStart,
  showingEnd,
  totalResults,
  itemLabel = "results",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing {showingStart}–{showingEnd} of {totalResults} {itemLabel}
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        {currentPage > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={buildHref(pathname, searchParams, currentPage - 1)} aria-label="Previous page">
              <ChevronLeft /> Prev
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft /> Prev
          </Button>
        )}

        {getVisiblePages(currentPage, totalPages).map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              key={p}
              asChild
              variant={p === currentPage ? "default" : "ghost"}
              size="sm"
            >
              <Link
                href={buildHref(pathname, searchParams, p)}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </Link>
            </Button>
          )
        )}

        {currentPage < totalPages ? (
          <Button asChild variant="outline" size="sm">
            <Link href={buildHref(pathname, searchParams, currentPage + 1)} aria-label="Next page">
              Next <ChevronRight />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next <ChevronRight />
          </Button>
        )}
      </nav>
    </div>
  );
}
