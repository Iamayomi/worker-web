"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, MapPin, Sparkles } from "lucide-react";

type MatchLevel = "Perfect Match" | "Solid Match" | "Moderate Match" | "Low Match";

type Role = {
  title: string;
  category: string;
  location: string;
  match: MatchLevel;
};

const roles: Role[] = [
  { title: "Senior Frontend Engineer", category: "Engineering", location: "Remote · Global", match: "Perfect Match" },
  { title: "Backend Engineer · Go", category: "Engineering", location: "Remote · Global", match: "Solid Match" },
  { title: "Product Designer", category: "Design", location: "London · Hybrid", match: "Perfect Match" },
  { title: "Data Scientist", category: "Data", location: "Remote · Global", match: "Solid Match" },
  { title: "DevOps Engineer", category: "Engineering", location: "Berlin · Hybrid", match: "Moderate Match" },
  { title: "Mobile Engineer · iOS", category: "Engineering", location: "Remote · Global", match: "Solid Match" },
  { title: "Product Manager", category: "Product", location: "New York · Remote", match: "Moderate Match" },
  { title: "UX Researcher", category: "Design", location: "Amsterdam · Hybrid", match: "Low Match" },
];

const categories = ["All", "Engineering", "Design", "Data", "Product"];

const matchStyles: Record<MatchLevel, string> = {
  "Perfect Match": "bg-primary text-primary-foreground",
  "Solid Match": "bg-primary/15 text-primary",
  "Moderate Match": "bg-muted text-muted-foreground",
  "Low Match": "bg-muted text-muted-foreground",
};

export function SmartSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [focused, setFocused] = useState(false);

  const filtered = roles.filter((role) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      role.title.toLowerCase().includes(q) ||
      role.category.toLowerCase().includes(q) ||
      role.location.toLowerCase().includes(q);
    const matchesCategory = category === "All" || role.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="w-full rounded-2xl border-2 border-foreground bg-background shadow-[8px_8px_0_0_#00a443]">
      <div className="flex items-center gap-3 border-b-2 border-foreground px-5 py-4">
        <Search className="h-5 w-5 shrink-0 text-primary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search for jobs, skills, or locations…"
          className="w-full bg-transparent text-lg font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:flex">
          <Sparkles className="h-3.5 w-3.5" />
          Smart Search
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b-2 border-foreground px-5 py-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setCategory(cat)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              category === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground/20 text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="p-3">
        <p className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          According to your preferences
        </p>
        <div className="space-y-1">
          {filtered.slice(0, 5).map((role) => (
            <Link
              key={role.title}
              href="/#jobs"
              className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-primary/5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{role.title}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {role.category} · <MapPin className="h-3 w-3" /> {role.location}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${matchStyles[role.match]}`}>
                {role.match}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              There are no results matching your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
