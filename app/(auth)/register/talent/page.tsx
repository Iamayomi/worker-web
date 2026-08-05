"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Check, LoaderCircle, Lock, Mail, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { usePageTitle } from "@/lib/hooks/use-page-title";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthGuard } from "@/components/auth-guard";
import { GoogleSignInButton } from "@/components/google-sign-in";
import { OtpVerification } from "@/components/otp-verification";
import { useRegisterTalent } from "@/hooks/api/useAuth";
import {
  AccountType,
  EmploymentType,
  WorkPreference,
  type RegisterTalentDto,
} from "@/types/api/auth";
import {
  COUNTRIES,
  COUNTRY_STATES,
  GENDER_OPTIONS,
  OTHER_OPTION,
  PROFESSIONAL_TITLES,
  SKILL_OPTIONS,
  YEARS_OF_EXPERIENCE_OPTIONS,
} from "@/lib/constants/options";
import { passwordSchema } from "@/schemas";

const talentSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  country: z.string().min(1, "Country is required"),
  stateOfResidence: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  professionalTitle: z.string().min(1, "Professional title is required"),
  yearsOfExperience: z.number().min(0, "Select your years of experience"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  employmentType: z.string().min(1, "Select an employment type"),
  workPreference: z.string().min(1, "Select a work preference"),
  termsAccepted: z.boolean().refine((v) => v, {
    message: "You must accept the Terms & Conditions and Privacy Policy",
  }),
});
type TalentFormValues = z.infer<typeof talentSchema>;

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data?.message as string) ||
      (error.response?.data?.error?.message as string) ||
      fallback
    );
  }
  return fallback;
};

export default function RegisterTalentPage() {
  usePageTitle("Create Talent Account");
  const [showPassword, setShowPassword] = useState(false);
  const [verification, setVerification] = useState<{
    email: string;
    reference: string;
  } | null>(null);
  const [customTitle, setCustomTitle] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  const registerTalent = useRegisterTalent();

  const form = useForm<TalentFormValues>({
    resolver: zodResolver(talentSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      country: "",
      stateOfResidence: "",
      gender: "",
      phone: "",
      professionalTitle: "",
      yearsOfExperience: 0,
      skills: [],
      employmentType: undefined,
      workPreference: undefined,
      termsAccepted: false,
    },
  });

  const selectedCountry = form.watch("country");
  const stateOptions = selectedCountry
    ? (COUNTRY_STATES[selectedCountry] ?? [])
    : [];
  const selectedSkills = form.watch("skills") ?? [];
  const yearsValue = form.watch("yearsOfExperience");

  function addSkill(skill: string) {
    if (!skill || selectedSkills.includes(skill)) return;
    form.setValue("skills", [...selectedSkills, skill]);
  }

  function removeSkill(skill: string) {
    form.setValue(
      "skills",
      selectedSkills.filter((s) => s !== skill)
    );
  }

  function handleCustomSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSkill();
    }
  }

  function addCustomSkill() {
    const skill = customSkill.trim();
    if (!skill) return;
    addSkill(skill);
    setCustomSkill("");
  }

  const onSubmit = form.handleSubmit((values) => {
    const payload: RegisterTalentDto = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      country: values.country,
      stateOfResidence: values.stateOfResidence || undefined,
      gender: values.gender || undefined,
      phone: values.phone || undefined,
      professionalTitle: values.professionalTitle,
      yearsOfExperience: values.yearsOfExperience,
      skills: values.skills,
      employmentType: values.employmentType as EmploymentType,
      workPreference: values.workPreference as WorkPreference,
      termsAccepted: values.termsAccepted,
    };

    registerTalent.mutate(payload, {
      onSuccess: (response) => {
        toast.success(response.message || "Registration successful");
        setVerification({
          email: payload.email,
          reference: response.data.otp_reference,
        });
      },
      onError: (error) =>
        toast.error(errorMessage(error, "Registration failed. Please try again.")),
    });
  });

  return (
    <AuthGuard>
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[1.2fr_1fr]">
        <div className="relative hidden md:block">
          <Image
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1600&q=90&auto=format&fit=crop"
            alt="Black professional woman working as talent"
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/85" />
          <div className="absolute inset-x-0 top-0 p-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Create your talent account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Join Worker to find work and get matched with companies worldwide.
            </p>
          </div>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 p-6">
            <div className="rounded-xl border border-white/20 bg-black/30 p-4 backdrop-blur-sm">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">40+</p>
                  <p className="text-xs text-white/70">Countries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">10K+</p>
                  <p className="text-xs text-white/70">Open roles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-white/70">Free to join</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6">
            <ul className="space-y-1.5 text-sm text-white/90">
              {["Get discovered by verified employers", "Apply to roles in one tap", "Salary transparency on every job"].map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          {verification ? (
            <OtpVerification email={verification.email} reference={verification.reference} />
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Create your talent account</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Join Worker to find work and get matched with companies worldwide.
                </p>
              </div>

              <div className="mb-6 space-y-3">
                <GoogleSignInButton accountType={AccountType.TALENT} />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  or
                  <div className="h-px flex-1 bg-border" />
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="talent-first-name">
                      First name<span className="text-foreground"> *</span>
                    </Label>
                    <Input
                      id="talent-first-name"
                      placeholder="Jane"
                      {...form.register("firstName")}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="talent-last-name">
                      Last name<span className="text-foreground"> *</span>
                    </Label>
                    <Input
                      id="talent-last-name"
                      placeholder="Doe"
                      {...form.register("lastName")}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="talent-email">
                    Email address<span className="text-foreground"> *</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="talent-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9"
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="talent-password">
                    Password<span className="text-foreground"> *</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="talent-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="pl-9 pr-10"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Country<span className="text-foreground"> *</span>
                  </Label>
                  <Select
                    value={form.watch("country") || undefined}
                    onValueChange={(value) => {
                      form.setValue("country", value);
                      form.setValue("stateOfResidence", "");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.country && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.country.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>State of residence</Label>
                    {stateOptions.length > 0 ? (
                      <Select
                        value={form.watch("stateOfResidence") || undefined}
                        onValueChange={(value) =>
                          form.setValue("stateOfResidence", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {stateOptions.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Enter state / region"
                        {...form.register("stateOfResidence")}
                      />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="talent-phone">Phone</Label>
                    <Controller
                      name="phone"
                      control={form.control}
                      render={({ field }) => (
                        <PhoneInput
                          id="talent-phone"
                          country={selectedCountry}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Professional title<span className="text-foreground"> *</span>
                  </Label>
                  <Select
                    value={
                      customTitle ? OTHER_OPTION : form.watch("professionalTitle") || undefined
                    }
                    onValueChange={(value) => {
                      if (value === OTHER_OPTION) {
                        setCustomTitle(true);
                        form.setValue("professionalTitle", "");
                      } else {
                        setCustomTitle(false);
                        form.setValue("professionalTitle", value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your professional title" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {PROFESSIONAL_TITLES.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                      <SelectItem value={OTHER_OPTION}>Other…</SelectItem>
                    </SelectContent>
                  </Select>
                  {customTitle && (
                    <Input
                      id="talent-custom-title"
                      placeholder="Enter your professional title"
                      autoFocus
                      {...form.register("professionalTitle")}
                    />
                  )}
                  {form.formState.errors.professionalTitle && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.professionalTitle.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Select
                      value={form.watch("gender") || undefined}
                      onValueChange={(value) => form.setValue("gender", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      Years of experience<span className="text-foreground"> *</span>
                    </Label>
                    <Select
                      value={yearsValue ? String(yearsValue) : undefined}
                      onValueChange={(value) =>
                        form.setValue("yearsOfExperience", parseInt(value, 10))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS_OF_EXPERIENCE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.yearsOfExperience && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.yearsOfExperience.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Skills<span className="text-foreground"> *</span>
                  </Label>
                  <Select key={selectedSkills.length} defaultValue="" onValueChange={addSkill}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Add a skill" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {SKILL_OPTIONS.map((skill) => (
                        <SelectItem
                          key={skill}
                          value={skill}
                          disabled={selectedSkills.includes(skill)}
                        >
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={handleCustomSkillKeyDown}
                      placeholder="Add a custom skill"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCustomSkill}
                      disabled={!customSkill.trim()}
                      aria-label="Add custom skill"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            aria-label={`Remove ${skill}`}
                            onClick={() => removeSkill(skill)}
                            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {form.formState.errors.skills && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.skills.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>
                      Employment type<span className="text-foreground"> *</span>
                    </Label>
                    <Select
                      value={form.watch("employmentType") || undefined}
                      onValueChange={(value) =>
                        form.setValue("employmentType", value as EmploymentType)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(EmploymentType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.employmentType && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.employmentType.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      Work preference<span className="text-foreground"> *</span>
                    </Label>
                    <Select
                      value={form.watch("workPreference") || undefined}
                      onValueChange={(value) =>
                        form.setValue("workPreference", value as WorkPreference)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(WorkPreference).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.workPreference && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.workPreference.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="talent-terms"
                    checked={form.watch("termsAccepted")}
                    onCheckedChange={(checked) =>
                      form.setValue("termsAccepted", checked === true)
                    }
                    aria-invalid={!!form.formState.errors.termsAccepted}
                  />
                  <label
                    htmlFor="talent-terms"
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
                {form.formState.errors.termsAccepted && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.termsAccepted.message}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={registerTalent.isPending}
                  className="w-full"
                >
                  {registerTalent.isPending && <LoaderCircle className="size-4 animate-spin" />}
                  Create talent account
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Hiring instead?{" "}
                <Link href="/register/client" className="font-medium text-primary hover:underline">
                  Create a client account
                </Link>
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
