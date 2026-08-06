"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  FileText,
  LoaderCircle,
  Search,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { worker } from "@/lib/api/worker";
import { useAuth } from "@/lib/auth/auth-context";
import { useCreateConversation } from "@/lib/hooks/use-chat";
import type { JobListData } from "@/types/api/jobs";
import type { PostListData } from "@/types/api/posts";
import type { SearchPeopleItem } from "@/lib/types/chat";

function initials(name?: string, email?: string): string {
  const source = name || email || "?";
  return source
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface SearchResults {
  jobs: JobListData["jobs"];
  posts: PostListData["posts"];
  people: SearchPeopleItem[];
}

export function GlobalSearch() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const createConversation = useCreateConversation();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    jobs: [],
    posts: [],
    people: [],
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) {
      setResults({ jobs: [], posts: [], people: [] });
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      const enc = encodeURIComponent(q);
      try {
        const [jobsRes, postsRes, peopleRes] = await Promise.all([
          worker.get<JobListData>(`/jobs?query=${enc}&limit=5`),
          worker.get<PostListData>(`/content/posts?query=${enc}&limit=5`),
          isAuthenticated
            ? worker.auth.get<{ items: SearchPeopleItem[] }>(
                `/chat/people/search?q=${enc}`,
              )
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setResults({
          jobs: jobsRes.success ? jobsRes.data?.jobs ?? [] : [],
          posts: postsRes.success ? postsRes.data?.posts ?? [] : [],
          people: peopleRes?.success ? peopleRes.data?.items ?? [] : [],
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [debounced, isAuthenticated]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const startChat = async (person: SearchPeopleItem) => {
    if (!isAuthenticated) {
      go("/login?redirect=/messages");
      return;
    }
    try {
      const result = await createConversation.mutateAsync({
        participantIds: [person.userId],
      });
      if (result?.id) go(`/messages/${result.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start chat");
    }
  };

  const trimmed = debounced.trim();
  const hasQuery = trimmed.length >= 2;
  const hasAny = results.jobs.length + results.posts.length + results.people.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 text-sm text-muted-foreground transition-colors hover:border-ring/60 hover:bg-secondary/70 md:inline-flex"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search jobs, people, resources...</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline-block">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search jobs, people and resources"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search jobs, people, resources..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {!loading && !hasQuery && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search.
              </div>
            )}

            {!loading && hasQuery && !hasAny && (
              <CommandEmpty>No results for &quot;{trimmed}&quot;</CommandEmpty>
            )}

            {!loading && hasQuery && results.jobs.length > 0 && (
              <CommandGroup heading="Jobs">
                {results.jobs.map((job) => (
                  <CommandItem
                    key={job.id}
                    value={`job:${job.id}`}
                    onSelect={() => go(`/jobs/${job.slug}`)}
                  >
                    <Briefcase className="size-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{job.title}</span>
                      {job.companyName && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {job.companyName}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!loading && hasQuery && results.people.length > 0 && (
              <CommandGroup heading="People">
                {results.people.map((person) => (
                  <CommandItem
                    key={person.userId}
                    value={`person:${person.userId}`}
                    onSelect={() => void startChat(person)}
                  >
                    <Avatar className="size-5">
                      {person.avatarUrl && (
                        <AvatarImage src={person.avatarUrl} alt={person.name} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {initials(person.name, person.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{person.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {person.email}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!loading && hasQuery && results.posts.length > 0 && (
              <CommandGroup heading="Resources">
                {results.posts.map((post) => (
                  <CommandItem
                    key={post.id}
                    value={`post:${post.id}`}
                    onSelect={() => go(`/resources/${post.slug}`)}
                  >
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{post.title}</span>
                      {post.category && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {post.category}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!loading && hasQuery && (
              <>
                <CommandSeparator />
                <CommandItem
                  value="view-all"
                  onSelect={() =>
                    go(`/jobs?query=${encodeURIComponent(trimmed)}`)
                  }
                >
                  <Search className="size-4 text-muted-foreground" />
                  View all job results
                  <CommandShortcut>↵</CommandShortcut>
                </CommandItem>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
