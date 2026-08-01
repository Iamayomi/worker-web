"use client";

import { useState, use, type FormEvent } from "react";
import { worker } from "@/lib/api/worker";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AcceptInvitePage(props: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = use(props.searchParams);
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!searchParams.token) {
      setError("Missing invitation token");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions and Privacy Policy");
      return;
    }

    setLoading(true);
    const res = await worker.post("/auth/accept-invite", {
      token: searchParams.token,
      first_name: firstName,
      last_name: lastName,
      password,
      termsAccepted,
    });
    if (res.success) {
      router.push("/login?invite-accepted=true");
    } else {
      setError(res.message || "Failed to accept invitation");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Accept invitation</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up your account to join the team
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium">First name</label>
              <input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">Last name</label>
              <input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input id="password" type="password" required minLength={8} value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Min. 8 characters" />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="invite-terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 size-4 rounded border-input accent-primary"
            />
            <label
              htmlFor="invite-terms"
              className="text-sm leading-relaxed text-muted-foreground"
            >
              I agree to the{" "}
              <Link href="/terms" className="font-medium text-primary hover:underline">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Processing..." : "Accept invitation"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Already have an account? Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

