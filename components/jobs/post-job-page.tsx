"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, LoaderCircle, MailCheck } from "lucide-react";
import { useCreateJob } from "@/lib/hooks/use-jobs";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { useAuth } from "@/lib/auth/auth-context";
import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { JobForm } from "@/components/jobs/job-form";
import { AccountType, UserRole } from "@/types/api/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/ui/form-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { CreateJobData, CreateJobInput } from "@/types/api/jobs";

interface SignupState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  termsAccepted: boolean;
}

const initialSignup: SignupState = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  companyName: "",
  termsAccepted: false,
};

export function PostJobPage() {
  usePageTitle("Post a Job");
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const createJob = useCreateJob();
  const [result, setResult] = useState<CreateJobData | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [details, setDetails] = useState<CreateJobInput | null>(null);
  const [signup, setSignup] = useState<SignupState>(initialSignup);

  const myRoles = ((user?.roles ?? []) as UserRole[]);
  const isAdmin =
    myRoles.includes(UserRole.SUPER_ADMIN) || myRoles.includes(UserRole.ADMIN);
  const isTalent = user?.accountType === AccountType.TALENT && !isAdmin;

  const guestMode = !isAuthenticated;

  if (isTalent) {
    return (
      <AnimatedContent className="mx-auto max-w-3xl space-y-6 px-5 py-8 sm:px-8">
        <PageHeader
          title="Post a job"
          description="Job posting is reserved for clients."
          backHref="/jobs"
        />
        <div className="rounded-xl border border-border/15 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight">
            Only clients can post jobs
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Posting a job requires a client account. As a talent, you can browse
            and apply to open roles instead.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/jobs">Browse jobs</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </AnimatedContent>
    );
  }

  const canFinish =
    signup.email &&
    signup.password.length >= 8 &&
    signup.firstName &&
    signup.lastName &&
    signup.companyName &&
    signup.termsAccepted;

  const postJob = (payload: CreateJobInput) => {
    createJob.mutate(payload, {
      onSuccess: (job) => {
        if (job.account_created) {
          setSignupOpen(false);
          setResult(job);
        } else {
          toast.success(
            job.status === "published" ? "Job published" : "Job saved as draft"
          );
          router.push("/jobs/mine");
        }
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to create job");
      },
    });
  };

  return (
    <AnimatedContent className="mx-auto max-w-3xl space-y-6 px-5 py-8 sm:px-8">
      {result?.account_created ? (
        <div className="rounded-xl border border-border/15 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10 text-green-600">
            <MailCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Job posted!</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Your job listing is live. We created your account and sent a 6-digit
            verification code to{" "}
            <span className="font-medium text-foreground">{signup.email}</span>.
            Verify your email to activate your account.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link
                href={`/verify-email?email=${encodeURIComponent(signup.email)}&reference=${encodeURIComponent(result.otp_reference ?? "")}`}
              >
                Verify email now
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <PageHeader
            title="Post a job"
            description={
              guestMode
                ? "Fill in the job details, then create your account to post."
                : "Create a listing to attract verified talent."
            }
            backHref={guestMode ? "/jobs" : "/jobs/mine"}
          />
          <div className="rounded-xl border border-border/15 p-6">
            <JobForm
              submitLabel={guestMode ? "Continue" : "Create job"}
              submitting={createJob.isPending}
              onSubmit={(data) => {
                if (guestMode) {
                  setDetails(data);
                  setSignupOpen(true);
                } else {
                  postJob(data);
                }
              }}
            />
          </div>

          {guestMode && (
            <Dialog open={signupOpen} onOpenChange={(open) => {
              if (!open && !createJob.isPending) setSignupOpen(false);
            }}>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create your account</DialogTitle>
                  <DialogDescription>
                    One last step — set up your account and your job will be
                    posted.
                  </DialogDescription>
                </DialogHeader>

                <form
                  className="space-y-4 py-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canFinish && !createJob.isPending) {
                      postJob({ ...(details ?? ({} as CreateJobInput)), signup });
                    }
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormInput
                      label="First name"
                      value={signup.firstName}
                      onChange={(e) =>
                        setSignup({ ...signup, firstName: e.target.value })
                      }
                      required
                    />
                    <FormInput
                      label="Last name"
                      value={signup.lastName}
                      onChange={(e) =>
                        setSignup({ ...signup, lastName: e.target.value })
                      }
                      required
                    />
                    <FormInput
                      label="Company name"
                      value={signup.companyName}
                      onChange={(e) =>
                        setSignup({ ...signup, companyName: e.target.value })
                      }
                      placeholder="e.g. Acme Inc."
                      required
                    />
                    <FormInput
                      label="Email"
                      type="email"
                      value={signup.email}
                      onChange={(e) =>
                        setSignup({ ...signup, email: e.target.value })
                      }
                      placeholder="you@company.com"
                      required
                    />
                    <div className="sm:col-span-2">
                      <FormInput
                        label="Password"
                        type="password"
                        value={signup.password}
                        onChange={(e) =>
                          setSignup({ ...signup, password: e.target.value })
                        }
                        placeholder="8+ characters"
                        required
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={signup.termsAccepted}
                      onCheckedChange={(checked) =>
                        setSignup({ ...signup, termsAccepted: checked === true })
                      }
                      className="mt-0.5"
                    />
                    <span>
                      I agree to the{" "}
                      <span className="font-medium text-primary">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="font-medium text-primary">
                        Privacy Policy
                      </span>
                      .
                    </span>
                  </label>

                  <DialogFooter className="gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSignupOpen(false)}
                      disabled={createJob.isPending}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={!canFinish || createJob.isPending}>
                      {createJob.isPending && (
                        <LoaderCircle className="size-4 animate-spin" />
                      )}
                      Create account & post
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </AnimatedContent>
  );
}
