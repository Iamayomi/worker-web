"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";

const options = [
  {
    href: "/register/talent",
    icon: Briefcase,
    title: "I'm Talent",
    description: "Find work and get matched with companies hiring worldwide.",
    bullets: ["Create a professional profile", "Get discovered by verified employers", "Apply to roles in one tap"],
    cta: "Create talent account",
  },
  {
    href: "/register/client",
    icon: Building2,
    title: "I'm a Client",
    description: "Hire vetted professionals for your team — anywhere in the world.",
    bullets: ["Post jobs and reach global talent", "Get matched with verified candidates", "Manage hiring in one place"],
    cta: "Create client account",
  },
];

export default function RegisterTypePage() {
  return (
    <AuthGuard>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Worker to find work or hire talent worldwide. First, tell us who you are.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {options.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  <option.icon className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold tracking-tight group-hover:text-primary">
                    {option.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{option.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <ul className="space-y-1.5">
                {option.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthGuard>
  );
}
