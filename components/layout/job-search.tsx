"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function JobSearch({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const router = useRouter();
  const [term, setTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    router.push(q ? `/jobs?query=${encodeURIComponent(q)}` : "/jobs");
  };

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <div className="relative">
        <Search
          className={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
            light ? "text-blue-300" : "text-muted-foreground"
          )}
        />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search jobs, roles, or companies..."
          aria-label="Search jobs"
          className={cn(
            "h-11 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-all placeholder:text-muted-foreground",
            light
              ? "border-white/60 bg-white/95 text-slate-900 placeholder:text-slate-400 focus:border-white focus:ring-4 focus:ring-white/30"
              : "border-border bg-secondary/40 focus:border-ring focus:ring-2 focus:ring-ring/30"
          )}
        />
      </div>
    </form>
  );
}
