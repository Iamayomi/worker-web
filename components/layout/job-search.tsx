"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function JobSearch({ className }: { className?: string }) {
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
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search jobs..."
          aria-label="Search jobs"
          className="h-9 w-full rounded-lg border border-border bg-secondary/40 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </form>
  );
}
