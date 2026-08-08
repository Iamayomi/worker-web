"use client";

import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Code,
  Database,
  Headphones,
  Layers,
  Megaphone,
  Palette,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WorldMap } from "@/components/world-map";
import { AppleIcon } from "@/components/icons/apple-icon";
import { GooglePlayIcon } from "@/components/icons/google-play-icon";
import { worker } from "@/lib/api/worker";
import type { JobListData, Job as ApiJob } from "@/types/api/jobs";
import type { Post as ApiPost, PostListData } from "@/types/api/posts";
import { EMPLOYMENT_TYPES, WORK_PREFERENCES } from "@/lib/constants/enums";
import {
  JOB_CATEGORIES,
  JOB_EXPERIENCE_LEVELS,
} from "@/lib/constants/options";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Job = {
  id?: string;
  company: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  category: string;
  skills: string[];
  experience: string;
  match?: "Perfect Match" | "Solid Match";
};

type BlogPost = {
  slug?: string;
  tag: string;
  title: string;
  excerpt: string;
  meta: string;
};

function toBlogPost(post: ApiPost): BlogPost {
  return {
    slug: post.slug,
    tag: post.category ?? "Article",
    title: post.title,
    excerpt: post.excerpt ?? "",
    meta: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "New",
  };
}

function toLandingJob(job: ApiJob): Job {
  const preference =
    WORK_PREFERENCES.find((p) => p.value === job.workPreference)?.label ?? "";
  const type =
    EMPLOYMENT_TYPES.find((t) => t.value === job.employmentType)?.label ??
    job.employmentType;
  const currency = (job.currency ?? "USD").toUpperCase();
  const salary =
    job.salaryMin != null && job.salaryMax != null
      ? `${currency} ${job.salaryMin.toLocaleString()} – ${currency} ${job.salaryMax.toLocaleString()}`
      : job.salaryMin != null
        ? `${currency} ${job.salaryMin.toLocaleString()}+`
        : job.salaryMax != null
          ? `Up to ${currency} ${job.salaryMax.toLocaleString()}`
          : "Salary negotiable";

  return {
    id: job.id,
    company: job.companyName ?? "Company",
    title: job.title,
    location: job.location ? `${job.location} · ${preference}` : preference,
    type,
    salary,
    category: job.category ?? "Other",
    skills: job.skillsRequired,
    experience: job.experienceRequired ?? "Any level",
    match: job.matchLabel,
  };
}

const fallbackJobs: Job[] = [
  { company: "Meridian Labs", title: "Senior Frontend Engineer", location: "Remote · Global", type: "Full-time", salary: "$90k – $140k", category: "Engineering", skills: ["React", "TypeScript", "Next.js"], experience: "Senior", match: "Perfect Match" },
  { company: "Northwind", title: "Backend Engineer · Go", location: "Berlin · Hybrid", type: "Full-time", salary: "€70k – €110k", category: "Engineering", skills: ["Go", "PostgreSQL", "Kubernetes"], experience: "Mid-level", match: "Solid Match" },
  { company: "Aurora Studio", title: "Product Designer", location: "London · Hybrid", type: "Full-time", salary: "£60k – £85k", category: "Design", skills: ["Figma", "Design Systems", "Prototyping"], experience: "Mid-level", match: "Perfect Match" },
  { company: "Vertex AI", title: "Data Scientist", location: "Remote · Global", type: "Full-time", salary: "$110k – $160k", category: "Data", skills: ["Python", "ML", "SQL"], experience: "Senior", match: "Solid Match" },
  { company: "Lumina Health", title: "Mobile Engineer · iOS", location: "Amsterdam · Hybrid", type: "Contract", salary: "€80k – €120k", category: "Engineering", skills: ["Swift", "SwiftUI", "RxSwift"], experience: "Mid-level" },
  { company: "Acme Corp", title: "Product Manager", location: "New York · Remote", type: "Full-time", salary: "$120k – $170k", category: "Product", skills: ["Roadmapping", "B2B SaaS", "Analytics"], experience: "Senior" },
  { company: "Global Grid", title: "DevOps Engineer", location: "Remote · Global", type: "Full-time", salary: "$95k – $140k", category: "Engineering", skills: ["Terraform", "AWS", "CI/CD"], experience: "Mid-level" },
  { company: "Pixel&Co", title: "UX Researcher", location: "Remote · EMEA", type: "Contract", salary: "€50k – €75k", category: "Design", skills: ["User Research", "Usability", "Interviews"], experience: "Entry-level" },
  { company: "Brightwave", title: "Sales Development Representative", location: "Remote · Global", type: "Full-time", salary: "$45k – $65k", category: "Sales", skills: ["Outbound", "CRM", "Pipeline"], experience: "Entry-level" },
  { company: "Clearview", title: "Marketing Manager", location: "Remote · Global", type: "Full-time", salary: "$70k – $95k", category: "Marketing", skills: ["SEO", "Content", "Analytics"], experience: "Mid-level" },
  { company: "Evergreen Co", title: "Customer Support Specialist", location: "Remote · EMEA", type: "Full-time", salary: "$35k – $50k", category: "Customer Support", skills: ["Zendesk", "Emails", "CSAT"], experience: "Entry-level" },
  { company: "Finli Group", title: "Financial Analyst", location: "London · On-site", type: "Full-time", salary: "£45k – £65k", category: "Finance", skills: ["Excel", "Forecasting", "Reporting"], experience: "Mid-level" },
  { company: "Kite Digital", title: "Account Executive", location: "Remote · US", type: "Full-time", salary: "$60k – $90k + commission", category: "Sales", skills: ["Enterprise Sales", "Negotiation", "CRM"], experience: "Mid-level" },
];

const categoryMeta: { name: string; icon: typeof Code; description: string }[] = [
  { name: "Engineering", icon: Code, description: "Frontend, backend, mobile, DevOps" },
  { name: "Design", icon: Palette, description: "Product, UX, brand, research" },
  { name: "Data", icon: Database, description: "Analytics, ML, engineering" },
  { name: "Product", icon: Layers, description: "PM, program, product ops" },
  { name: "Sales", icon: TrendingUp, description: "SDR, AE, account management" },
  { name: "Marketing", icon: Megaphone, description: "Growth, content, brand, SEO" },
  { name: "Customer Support", icon: Headphones, description: "Support, success, CSAT" },
  { name: "Finance", icon: Wallet, description: "Accounting, analysis, FP&A" },
  { name: "HR", icon: Users, description: "Recruiting, people ops, L&D" },
];

const companies = [
  "Meridian Labs", "Northwind", "Aurora Studio", "Vertex AI", "Lumina Health",
  "Acme Corp", "Global Grid", "Pixel&Co", "Brightwave", "Clearview", "Kite Digital", "TrueNorth",
];

const testimonials = [
  {
    quote:
      "We filled two senior roles in two weeks. The candidates were verified, senior, and ready to go.",
    name: "Amara Okafor",
    role: "VP Engineering, Meridian Labs",
  },
  {
    quote:
      "I moved from Lagos to a remote role at a Berlin startup. Worker handled the pay, contract, and onboarding.",
    name: "Tobi Adeyemi",
    role: "Backend Engineer",
  },
  {
    quote:
      "Posting a job took five minutes. Within a day we had a shortlist of matches that actually fit our team.",
    name: "Sofia Moretti",
    role: "Founder, Aurora Studio",
  },
];

const fallbackBlog: BlogPost[] = [
  {
    tag: "Hiring",
    title: "How to write a job post that gets real responses",
    excerpt: "Clear titles, honest salary bands, and the five sections every strong job post needs.",
    meta: "6 min read",
  },
  {
    tag: "Remote work",
    title: "Remote hiring in 2026: the complete global guide",
    excerpt: "Payroll, contracts, time zones, and culture across 40+ countries — everything you need.",
    meta: "11 min read",
  },
  {
    tag: "Careers",
    title: "How to stand out as a candidate on Worker",
    excerpt: "Make your profile match-ready: skills, experience, and what recruiters scan for first.",
    meta: "4 min read",
  },
];

const whyHireGlobally = [
  "Access verified talent in 40+ countries, not just your city",
  "Post a job in minutes and get matched with candidates",
  "Local contracts, payroll, and compliance handled for you",
  "Flexible remote, hybrid, and on-site hiring options",
];

const trustBadges = [
  { icon: Star, text: "4.9/5 average rating" },
  { icon: ShieldCheck, text: "GDPR compliant" },
  { icon: Headphones, text: "24/7 human support" },
  { icon: BadgeCheck, text: "Verified profiles" },
];

const locations = ["Remote · Global", "Remote · EMEA", "Remote · US", "Berlin · Hybrid", "London · Hybrid", "London · On-site", "New York · Remote", "New York · Hybrid", "Amsterdam · Hybrid"];

const WORK_PREFERENCE_BY_SUFFIX: Record<string, string> = {
  Remote: "remote",
  Hybrid: "hybrid",
  "On-site": "on-site",
};

function locationToParams(value: string): {
  location?: string;
  workPreference?: string;
} {
  if (value === "Anywhere") return {};
  const [loc, suffix] = value.split(" · ");
  return {
    location: loc,
    workPreference: suffix ? WORK_PREFERENCE_BY_SUFFIX[suffix] : undefined,
  };
}

export default function LandingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [jobs, setJobs] = useState<Job[]>(fallbackJobs);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(fallbackBlog);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [jobsRes, postsRes] = await Promise.allSettled([
          worker.get<JobListData>("/jobs?limit=50"),
          worker.get<PostListData>("/content/posts?limit=3"),
        ]);
        if (!cancelled) {
          if (
            jobsRes.status === "fulfilled" &&
            jobsRes.value.success &&
            jobsRes.value.data?.jobs?.length
          ) {
            setJobs(jobsRes.value.data.jobs.map(toLandingJob));
          }
          if (
            postsRes.status === "fulfilled" &&
            postsRes.value.success &&
            postsRes.value.data?.posts?.length
          ) {
            setBlogPosts(postsRes.value.data.posts.map(toBlogPost));
          }
        }
      } catch {
        // Keep the fallback lists when the API is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Anywhere");
  const [category, setCategory] = useState("All");
  const [experience, setExperience] = useState("Any level");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const applyCategory = (cat: string) => {
    setCategory(cat);
    document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
  };

  const searchHref = (() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (category !== "All") params.set("category", category);
    if (experience !== "Any level") params.set("experience", experience);
    const { location: loc, workPreference } = locationToParams(location);
    if (loc) params.set("location", loc);
    if (workPreference) params.set("workPreference", workPreference);
    return params.toString() ? `/jobs?${params.toString()}` : "/jobs";
  })();

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      router.push(searchHref);
    }
  };

  const filtered = jobs.filter((job) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q));
    const matchesLocation = location === "Anywhere" || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesCategory = category === "All" || job.category === category;
    const matchesExperience = experience === "Any level" || job.experience === experience;
    return matchesQuery && matchesLocation && matchesCategory && matchesExperience;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border bg-background">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source
              src="https://cdn.pixabay.com/video/2017/03/08/8252-207598592_large.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
            <div className="mx-auto max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
                Worker — Global job marketplace
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                Find and hire the best talent worldwide.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
                Post jobs, review verified talent, and build your team across 40+ countries — or
                find your next opportunity with companies around the world.
              </p>

              <div className="mx-auto mt-8 w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] md:items-stretch">
                  <div className="px-5 py-4 text-left">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      What
                    </label>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Job title, keyword, or company"
                      className="mt-1 w-full bg-transparent text-base font-medium focus:outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="border-t border-border px-5 py-4 text-left md:border-l md:border-t-0">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Where
                    </label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="mt-1 w-full border-0 bg-transparent p-0 text-base font-medium text-muted-foreground shadow-none focus-visible:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="Anywhere">Anywhere</SelectItem>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border-t border-border px-5 py-4 text-left md:border-l md:border-t-0">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Category
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1 w-full border-0 bg-transparent p-0 text-base font-medium text-muted-foreground shadow-none focus-visible:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="All">All</SelectItem>
                        {JOB_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border-t border-border px-5 py-4 text-left md:border-l md:border-t-0">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Experience
                    </label>
                    <Select value={experience} onValueChange={setExperience}>
                      <SelectTrigger className="mt-1 w-full border-0 bg-transparent p-0 text-base font-medium text-muted-foreground shadow-none focus-visible:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="Any level">Any level</SelectItem>
                        {JOB_EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border-t border-border p-3 text-left md:border-l md:border-t-0">
                    <Link
                      href={searchHref}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:h-full"
                    >
                      <Search className="h-[18px] w-[18px]" />
                      Search
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Post a job
                </Link>
              </div>
            </div>
          </div>

          <button
            onClick={togglePlay}
            aria-label={playing ? "Pause background video" : "Play background video"}
            className="absolute bottom-5 right-5 z-10 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/40 bg-black/30 px-4 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
              {playing ? (
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              ) : (
                <path d="M7 4.5v15l13-7.5z" />
              )}
            </svg>
            {playing ? "Pause" : "Play"}
          </button>
        </section>

        <section className="border-b border-border bg-background">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 sm:px-8">
            {trustBadges.map((badge) => (
              <div key={badge.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <badge.icon className="h-4 w-4 text-primary" />
                {badge.text}
              </div>
            ))}
          </div>
        </section>

        <section id="jobs" className="scroll-mt-16 bg-background py-14 sm:py-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Latest jobs</h2>
                <p className="mt-2 text-muted-foreground">{filtered.length} roles matching your search</p>
              </div>
              <Link href="/jobs" className="text-sm font-medium text-primary hover:underline">
                View all jobs
              </Link>
            </div>

            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {filtered.map((job) => (
                <div
                  key={job.id ?? job.title}
                  className="group flex flex-col gap-4 p-6 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight group-hover:text-primary">
                      {job.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{job.location}</span>
                      <span>{job.experience}</span>
                      <span>{job.type}</span>
                      <span>{job.salary}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span key={skill} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    {job.match && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          job.match === "Perfect Match"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {job.match}
                      </span>
                    )}
                    <Link
                      href={job.id ? `/jobs/${job.id}` : "/jobs"}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-border px-5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-10 rounded-xl border border-dashed border-border p-16 text-center">
                <p className="text-lg font-semibold">No roles match your search</p>
                <p className="mt-2 text-sm text-muted-foreground">Try a different keyword, location, or category.</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-background py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse by category</h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
                Pick a field and jump straight to the roles that fit.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryMeta.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => applyCategory(cat.name)}
                  className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                    <cat.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="flex items-center gap-2 text-base font-semibold tracking-tight">
                      {cat.name}
                      <span className="text-sm font-normal text-muted-foreground">
                        {jobs.filter((j) => j.category === cat.name).length}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{cat.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/50 py-12">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Hiring on Worker right now
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {companies.map((company) => (
                <span key={company} className="text-lg font-semibold text-muted-foreground">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-14 sm:py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why hire globally</h2>
              <p className="mt-3 max-w-md text-base text-muted-foreground">
                Great talent isn't limited by geography. Worker makes it effortless to hire the best
                people anywhere in the world.
              </p>
              <ul className="mt-8 space-y-4">
                {whyHireGlobally.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-base text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Post a job
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-muted/50 p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Save on hiring
              </p>
              <p className="mt-4 text-4xl font-bold tracking-tight">$23K</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                average annual savings per remote hire compared to local hiring in high-cost cities,
                across salary, office space, and benefits.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { label: "Faster to fill", value: "9 days" },
                  { label: "Candidate response", value: "72 hours" },
                  { label: "Retention after 1 year", value: "91%" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className="text-sm font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How to get started</h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
                From sign-up to your first match in minutes.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Create your profile",
                  description:
                    "Tell us who you are — a professional looking for work or a company hiring talent.",
                  image:
                    "https://plus.unsplash.com/premium_photo-1696942353102-0a5def645595?w=800&q=80&auto=format&fit=crop",
                  alt: "A man in a suit and tie holding a binder",
                  href: "/register",
                  cta: "Create a free profile",
                },
                {
                  step: "2",
                  title: "Post a job or find one",
                  description:
                    "Post an open role and get matched with verified candidates, or search jobs that fit your skills.",
                  image:
                    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80&auto=format&fit=crop",
                  alt: "Professional working on a laptop",
                  href: "/jobs",
                  cta: "Browse jobs",
                },
                {
                  step: "3",
                  title: "Hire or get hired",
                  description:
                    "Review matches, connect, and grow your team or your career with companies worldwide.",
                  image:
                    "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80&auto=format&fit=crop",
                  alt: "Black business professionals collaborating in an office",
                  href: "/register",
                  cta: "Get started today",
                },
              ].map((card) => (
                <div
                  key={card.step}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="relative">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      width={800}
                      height={480}
                      className="h-44 w-full object-cover"
                    />
                    <span className="absolute left-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {card.step}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold tracking-tight">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                    <Link
                      href={card.href}
                      className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      {card.cta} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/50 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Hire and get hired anywhere
                </h2>
                <p className="mt-3 max-w-md text-base text-muted-foreground">
                  Worker connects talent and companies across the globe — from Lagos to London to
                  Singapore. Real-time matches, local pay, and zero borders.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-6">
                  {[
                    { value: "40+", label: "Countries" },
                    { value: "1.5M+", label: "Professionals" },
                    { value: "30K+", label: "Companies hiring" },
                    { value: "96%", label: "Placement satisfaction" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
                <WorldMap />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Loved by talent and companies</h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
                Real stories from people who hired — and got hired — on Worker.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.name}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-base leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 border-t border-border pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{testimonial.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/50 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">From the blog</h2>
                <p className="mt-3 max-w-xl text-base text-muted-foreground">
                  Guides on hiring, landing roles, and building a global career.
                </p>
              </div>
              <Link href="/blog" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex">
                View all articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {blogPosts.map((post) => (
                <Link
                  key={post.title}
                  href={post.slug ? `/resources/${post.slug}` : "/resources"}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {post.tag}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                  <span className="mt-4 text-sm text-muted-foreground">{post.meta}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Never miss a job that fits</h2>
            <p className="mt-3 text-base text-muted-foreground">
              Get new roles in your inbox, matched to your skills and location. No spam, unsubscribe anytime.
            </p>
            {subscribed ? (
              <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-4 text-base font-medium">
                <Check className="h-5 w-5 text-primary" />
                You&rsquo;re subscribed — we&rsquo;ll send jobs that match.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSubscribed(true);
                }}
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-12 flex-1 rounded-md border border-border bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get job alerts
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="bg-primary py-14 sm:py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                Search jobs from anywhere
              </h2>
              <p className="mt-3 max-w-md text-base text-primary-foreground/80">
                Apply in one tap, get matched on the go, and track your applications from your phone.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary-foreground px-5 text-base font-medium text-primary transition-colors hover:opacity-90"
                >
                  <AppleIcon className="h-5 w-5" />
                  App Store
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-primary-foreground/40 bg-transparent px-5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <GooglePlayIcon className="h-5 w-5" />
                  Google Play
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">
                App highlights
              </p>
              <ul className="mt-5 space-y-4">
                {[
                  "Instant matches with verified employers",
                  "One-tap apply with your saved profile",
                  "Salary transparency on every role",
                  "Offline access to your applications",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-base text-primary-foreground">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-primary">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-muted/50 py-14 text-center sm:py-16">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Build your dream team</h2>
            <p className="mt-3 text-base text-muted-foreground">
              Join thousands of companies and professionals on Worker.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                Create a free account
              </Link>
              <Link href="/jobs" className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-base font-medium transition-colors hover:bg-muted">
                Browse jobs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {showNotification && (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg sm:bottom-6 sm:right-6">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">New jobs this week</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              30+ verified remote roles were just added. Find your next match.
            </p>
            <Link
              href="/jobs"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Browse jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setShowNotification(false)}
            aria-label="Dismiss notification"
            className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

