import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Globe,
  Mail,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Worker Talent Market Report — Hiring Insights 2026",
  description:
    "The Worker Talent Market Report: global remote hiring trends, time-to-fill, retention, salary transparency, and where top talent is hiring in 2026.",
};

const headlineStats = [
  { icon: Clock, value: "9 days", label: "Median time-to-fill on Worker" },
  { icon: Mail, value: "72 hrs", label: "Median candidate response time" },
  { icon: ShieldCheck, value: "91%", label: "Retention after one year" },
  { icon: Wallet, value: "$23K", label: "Avg. annual savings per remote hire" },
];

const platformStats = [
  { icon: Globe, value: "40+", label: "Countries with active hiring" },
  { icon: Users, value: "1.5M+", label: "Verified professionals" },
  { icon: TrendingUp, value: "30K+", label: "Companies hiring on Worker" },
  { icon: ShieldCheck, value: "96%", label: "Placement satisfaction" },
];

const insights = [
  {
    title: "Remote hiring keeps rising",
    body: "Remote roles now make up the majority of placements on Worker. Companies that open roles to global talent fill positions faster and at lower cost than those restricted to a single city.",
  },
  {
    title: "Salary transparency wins",
    body: "Job posts with a clear salary band receive significantly more qualified applications. Top talent filters for honesty — and rewards employers who publish real numbers.",
  },
  {
    title: "Verified talent converts",
    body: "Profiles with verified identity and experience are far more likely to reach shortlist and offer stages. Verification is the strongest signal of candidate quality on the platform.",
  },
  {
    title: "Speed is the new perk",
    body: "Companies that respond to candidates within 72 hours close hires at a much higher rate. The fastest employers consistently win the best candidates.",
  },
];

export default function TalentMarketReportPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Worker Talent Market Report · August 2026
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            The state of global hiring
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Real data from real hires on Worker — how long it takes to fill a
            role, where talent is, and what the best teams do differently.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Post a job
            </Link>
            <Link
              href="/jobs"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-base font-medium transition-colors hover:bg-muted"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            This month at a glance
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {headlineStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Where talent is hiring
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
                The market has gone global. Companies on Worker hire across
                engineering, design, data, product, and go-to-market teams —
                and the best candidates are no longer tied to one city.
              </p>
              <ul className="mt-6 space-y-3">
                {platformStats.map((stat) => (
                  <li
                    key={stat.label}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <stat.icon className="h-5 w-5 text-primary" />
                    <span className="text-lg font-bold">{stat.value}</span>
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <h2 className="text-lg font-semibold tracking-tight">
                Key findings
              </h2>
              <div className="mt-5 space-y-5">
                {insights.map((insight) => (
                  <div key={insight.title} className="border-l-2 border-primary/30 pl-4">
                    <h3 className="font-semibold">{insight.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {insight.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How we measure this
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Figures are computed from placements, applications, and verified
            profiles on Worker over the trailing 30 days. We publish a fresh
            report each month so employers and talent can make decisions on
            current data.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/blog"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-base font-medium transition-colors hover:bg-muted"
            >
              Read the blog
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Join Worker <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
