"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

type NotesSearchProps = {
  defaultValue?: string;
};

export function NotesSearch({ defaultValue = "" }: NotesSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const query = value.trim();

    if (query) params.set("q", query);

    startTransition(() => {
      router.push(params.toString() ? `/notes?${params}` : "/notes");
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 grid gap-2 border-y border-border/20 py-4 sm:grid-cols-[minmax(0,1fr)_auto]"
    >
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search here..."
          className="h-11 w-full rounded-none border border-border/35 bg-background/40 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
      </label>
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        data-umami-event="note_search_button_clicked"
        data-umami-event-link={value}
      >
        Search
      </Button>
    </form>
  );
}
