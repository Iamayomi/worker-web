"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, LoaderCircle, MailCheck, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import { FormSelect } from "@/components/ui/form-select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth/auth-context";
import { useApplyJob, useUploadCv } from "@/lib/hooks/use-jobs";
import { useTalentProfile } from "@/lib/hooks/use-profiles";
import { CURRENCIES } from "@/lib/constants/enums";
import { AccountType } from "@/types/api/auth";
import type { ApplyJobInput, Job } from "@/types/api/jobs";

interface ApplyJobDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ApplyJobDialog({ job, open, onOpenChange }: ApplyJobDialogProps) {
  const { isAuthenticated, user } = useAuth();
  const isTalentUser =
    isAuthenticated && user?.accountType === AccountType.TALENT;
  const isGuest = !isAuthenticated;
  const { data: talentProfile } = useTalentProfile(isTalentUser);
  const applyJob = useApplyJob();
  const uploadCv = useUploadCv();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"details" | "account" | "submitted">(
    "details"
  );
  const [applicantFirstName, setApplicantFirstName] = useState("");
  const [applicantLastName, setApplicantLastName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [cvUrl, setCvUrl] = useState("");
  const [cvName, setCvName] = useState("");
  const [savedCvDismissed, setSavedCvDismissed] = useState(false);
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savedCv =
    isTalentUser && !savedCvDismissed ? talentProfile?.resumeUrl ?? "" : "";
  const cvValue = cvUrl || savedCv;
  const cvDisplayName = cvName || "My saved CV";

  const reset = () => {
    setStep("details");
    setApplicantFirstName("");
    setApplicantLastName("");
    setApplicantEmail("");
    setApplicantPhone("");
    setYearsOfExperience("");
    setCoverLetter("");
    setProposedRate("");
    setCurrency("usd");
    setCvUrl("");
    setCvName("");
    setSavedCvDismissed(false);
    setPassword("");
    setTermsAccepted(false);
    setError(null);
  };

  const prefillTalent = () => {
    setApplicantFirstName(talentProfile?.firstName ?? "");
    setApplicantLastName(talentProfile?.lastName ?? "");
    setApplicantEmail(user?.email ?? "");
    setApplicantPhone(talentProfile?.phone ?? "");
    setYearsOfExperience(
      talentProfile?.yearsOfExperience != null
        ? String(talentProfile.yearsOfExperience)
        : ""
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      reset();
      if (isTalentUser) prefillTalent();
    }
    onOpenChange(next);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }
    uploadCv.mutate(file, {
      onSuccess: (data) => {
        setCvUrl(data.url);
        setCvName(file.name);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to upload CV");
      },
    });
  };

  const handleRemoveCv = () => {
    if (cvValue === savedCv) setSavedCvDismissed(true);
    setCvUrl("");
    setCvName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const emailValid = EMAIL_REGEX.test(applicantEmail.trim());
  const canSubmitDetails = isTalentUser
    ? true
    : Boolean(applicantFirstName.trim() && applicantLastName.trim() && emailValid);
  const canSubmitAccount =
    password.length >= 8 && termsAccepted;

  const buildPayload = (): ApplyJobInput => ({
    applicantFirstName: applicantFirstName.trim(),
    applicantLastName: applicantLastName.trim(),
    applicantEmail: applicantEmail.trim(),
    applicantPhone: applicantPhone.trim() || undefined,
    yearsOfExperience: yearsOfExperience
      ? Number(yearsOfExperience)
      : undefined,
    coverLetter: coverLetter || undefined,
    proposedRate: proposedRate ? Number(proposedRate) : undefined,
    currency,
    resumeUrl: cvValue || undefined,
    signup: isGuest ? { password, termsAccepted } : undefined,
  });

  const handleSubmit = () => {
    setError(null);
    applyJob.mutate(
      { jobId: job.id, data: buildPayload() },
      {
        onSuccess: (data) => {
          setStep("submitted");
          if (data.account_created) {
            toast.success("Application submitted — account created");
          } else {
            toast.success("Application submitted");
          }
        },
        onError: (err) => {
          const message =
            err instanceof Error ? err.message : "Failed to apply";
          if (message.toLowerCase().includes("already registered")) {
            setError(message);
          } else {
            toast.error(message);
          }
        },
      }
    );
  };

  const handleContinue = () => {
    setError(null);
    setStep("account");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {step === "submitted" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MailCheck className="h-5 w-5 text-green-600" />
                You&apos;re all set
              </DialogTitle>
              <DialogDescription>
                {isGuest ? (
                  <>
                    Your application for{" "}
                    <span className="font-medium text-foreground">
                      {job.title}
                    </span>{" "}
                    was submitted and your talent account has been created. We
                    sent a verification email to{" "}
                    <span className="font-medium text-foreground">
                      {applicantEmail}
                    </span>
                    . Sign in to track your application.
                  </>
                ) : (
                  <>
                    Your application for{" "}
                    <span className="font-medium text-foreground">
                      {job.title}
                    </span>{" "}
                    was submitted successfully.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
              {isGuest && (
                <Button asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {step === "account"
                  ? "Create your account to finish applying"
                  : `Apply to ${job.title}`}
              </DialogTitle>
              <DialogDescription>
                {step === "account"
                  ? "We'll use the details below to create your account. Verification won't block your application."
                  : isGuest
                    ? "Tell the client why you're a great fit. You'll create an account to finish."
                    : "Tell the client why you're a great fit."}
              </DialogDescription>
            </DialogHeader>

            {step === "details" ? (
              <div className="space-y-4 py-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput
                    label="First name"
                    value={applicantFirstName}
                    onChange={(e) => setApplicantFirstName(e.target.value)}
                    placeholder="e.g. Amina"
                  />
                  <FormInput
                    label="Last name"
                    value={applicantLastName}
                    onChange={(e) => setApplicantLastName(e.target.value)}
                    placeholder="e.g. Bello"
                  />
                </div>

                <FormInput
                  label="Email"
                  type="email"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="you@example.com"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput
                    label="Phone (optional)"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="e.g. +2348012345678"
                  />
                  <FormInput
                    label="Years of experience (optional)"
                    type="number"
                    min={0}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="e.g. 4"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  {isTalentUser
                    ? "These details are pre-filled from your profile and can be edited for this application only — your profile won't change."
                    : "These details will create your account when you apply."}
                </p>

                <FormTextarea
                  label="Cover letter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you a good fit for this role?"
                  rows={4}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput
                    label="Proposed rate (optional)"
                    type="number"
                    min={0}
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                    placeholder="e.g. 5000"
                  />
                  <FormSelect
                    label="Currency"
                    value={currency}
                    onValueChange={setCurrency}
                    options={CURRENCIES}
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">CV / resume (optional)</p>
                  {cvValue ? (
                    <div className="flex items-center gap-3 rounded-lg border border-border/15 bg-muted/30 p-3">
                      <FileText className="h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {cvDisplayName}
                        </div>
                        <a
                          href={cvValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View CV
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCv}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Remove CV"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadCv.isPending}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                    >
                      {uploadCv.isPending ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploadCv.isPending ? "Uploading…" : "Upload CV (PDF)"}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {isTalentUser && savedCv
                      ? "We'll use the CV from your profile. You can replace or remove it."
                      : "PDF only, up to 10MB."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="space-y-1 rounded-lg border border-border/15 bg-muted/30 p-4 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">
                      {applicantFirstName.trim()} {applicantLastName.trim()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{applicantEmail.trim()}</span>
                  </div>
                </div>

                <FormInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                />

                <label className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked === true)
                    }
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {error}
                    <Link
                      href={`/login?redirect=${encodeURIComponent(
                        `/jobs/${job.id}`
                      )}`}
                      className="mt-1 block font-medium text-destructive underline"
                    >
                      Sign in to apply
                    </Link>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              {step === "account" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setStep("details")}
                    disabled={applyJob.isPending}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmitAccount || applyJob.isPending}
                  >
                    {applyJob.isPending && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}
                    {applyJob.isPending
                      ? "Submitting…"
                      : "Create account & submit application"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={applyJob.isPending}
                  >
                    Cancel
                  </Button>
                  {isGuest ? (
                    <Button
                      onClick={handleContinue}
                      disabled={!canSubmitDetails || uploadCv.isPending}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={uploadCv.isPending}
                    >
                      {applyJob.isPending && (
                        <LoaderCircle className="size-4 animate-spin" />
                      )}
                      {applyJob.isPending
                        ? "Submitting…"
                        : "Submit application"}
                    </Button>
                  )}
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
