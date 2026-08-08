import Link from "next/link";
import { Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">
          404 · Page not found
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The link may be old, moved, or never existed. Check the address or
          head back to somewhere familiar.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/jobs">Browse jobs</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
