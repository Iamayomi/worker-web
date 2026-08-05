"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { usePageTitle } from "@/lib/hooks/use-page-title";

const options = [
  {
    href: "/register/talent",
    icon: Briefcase,
    title: "I'm Talent",
    description: "Find work with companies hiring worldwide",
  },
  {
    href: "/register/client",
    icon: Building2,
    title: "I'm a Client",
    description: "Hire vetted professionals anywhere",
  },
];

export default function RegisterTypePage() {
  usePageTitle("Create Account");
  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Briefcase className="h-6 w-6" />
        </div>

        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          First, tell us who you are.
        </p>

        <div className="mt-8 space-y-3">
          {options.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-muted/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                <option.icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold tracking-tight">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {option.description}
                </span>
              </span>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
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
