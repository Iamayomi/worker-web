"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { Controller, useForm } from "react-hook-form";import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  Check,
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { cn } from "@/lib/utils";

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
import { useRegisterTalent, useRegisterClient } from "@/hooks/api/useAuth";
import {
  AccountType,
  EmploymentType,
  WorkPreference,
  type RegisterTalentDto,
  type RegisterClientDto,
} from "@/types/api/auth";
import {
  COMPANY_SIZE_OPTIONS,
  COUNTRIES,
  COUNTRY_STATES,
  GENDER_OPTIONS,
  INDUSTRY_OPTIONS,
  OTHER_OPTION,
  PROFESSIONAL_TITLES,
  SKILL_OPTIONS,
  YEARS_OF_EXPERIENCE_OPTIONS,
} from "@/lib/constants/options";
import { passwordSchema } from "@/schemas";

type RegisterMode = "talent" | "client";

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

const clientSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  contactFirstName: z.string().min(1, "First name is required"),
  contactLastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Select an industry"),
  companySize: z.string().min(1, "Select a company size"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  companyDescription: z.string().optional(),
  termsAccepted: z.boolean().refine((v) => v, {
    message: "You must accept the Terms & Conditions and Privacy Policy",
  }),
});
type ClientFormValues = z.infer<typeof clientSchema>;

function RegisterTalentForm() {
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

  if (verification) {
    return <OtpVerification email={verification.email} reference={verification.reference} />;
  }

  return (
    <>
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
            <Input
              id="talent-email"
              type="email"
              placeholder="you@example.com"
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
            <Input
              id="talent-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="pr-10"
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
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

function RegisterClientForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [verification, setVerification] = useState<{
    email: string;
    reference: string;
  } | null>(null);

  const registerClient = useRegisterClient();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      email: "",
      password: "",
      contactFirstName: "",
      contactLastName: "",
      phone: "",
      country: "",
      companyName: "",
      industry: "",
      companySize: "",
      website: "",
      companyDescription: "",
      termsAccepted: false,
    },
  });

  const selectedCountry = form.watch("country");

  const onSubmit = form.handleSubmit((values) => {
    const payload: RegisterClientDto = {
      email: values.email,
      password: values.password,
      contactFirstName: values.contactFirstName,
      contactLastName: values.contactLastName,
      phone: values.phone,
      country: values.country,
      companyName: values.companyName,
      industry: values.industry,
      companySize: values.companySize,
      website: values.website || undefined,
      companyDescription: values.companyDescription || undefined,
      termsAccepted: values.termsAccepted,
    };

    registerClient.mutate(payload, {
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

  if (verification) {
    return <OtpVerification email={verification.email} reference={verification.reference} />;
  }

  return (
    <>
      <div className="mb-6 space-y-3">
        <GoogleSignInButton accountType={AccountType.CLIENT} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="client-first-name">
              Contact first name<span className="text-foreground"> *</span>
            </Label>
            <Input
              id="client-first-name"
              placeholder="Jane"
              {...form.register("contactFirstName")}
            />
            {form.formState.errors.contactFirstName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.contactFirstName.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client-last-name">
              Contact last name<span className="text-foreground"> *</span>
            </Label>
            <Input
              id="client-last-name"
              placeholder="Doe"
              {...form.register("contactLastName")}
            />
            {form.formState.errors.contactLastName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.contactLastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-email">
            Work email<span className="text-foreground"> *</span>
          </Label>
          <div className="relative">
            <Input
              id="client-email"
              type="email"
              placeholder="you@company.com"
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
          <Label htmlFor="client-password">
            Password<span className="text-foreground"> *</span>
          </Label>
          <div className="relative">
            <Input
              id="client-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="pr-10"
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="client-phone">
              Phone number<span className="text-foreground"> *</span>
            </Label>
            <Controller
              name="phone"
              control={form.control}
              render={({ field }) => (
                <PhoneInput
                  id="client-phone"
                  country={selectedCountry}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>
              Country<span className="text-foreground"> *</span>
            </Label>
            <Select
              value={form.watch("country") || undefined}
              onValueChange={(value) => form.setValue("country", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="client-company">
            Company name<span className="text-foreground"> *</span>
          </Label>
          <Input
            id="client-company"
            placeholder="Acme Corp"
            {...form.register("companyName")}
          />
          {form.formState.errors.companyName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.companyName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>
              Industry<span className="text-foreground"> *</span>
            </Label>
            <Select
              value={form.watch("industry") || undefined}
              onValueChange={(value) => form.setValue("industry", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {INDUSTRY_OPTIONS.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.industry && (
              <p className="text-sm text-destructive">
                {form.formState.errors.industry.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>
              Company size<span className="text-foreground"> *</span>
            </Label>
            <Select
              value={form.watch("companySize") || undefined}
              onValueChange={(value) => form.setValue("companySize", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.companySize && (
              <p className="text-sm text-destructive">
                {form.formState.errors.companySize.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="client-website">Website</Label>
            <Input
              id="client-website"
              type="url"
              placeholder="https://acme.com"
              {...form.register("website")}
            />
            {form.formState.errors.website && (
              <p className="text-sm text-destructive">
                {form.formState.errors.website.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client-description">Description</Label>
            <Input
              id="client-description"
              placeholder="A leading tech company..."
              {...form.register("companyDescription")}
            />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="client-terms"
            checked={form.watch("termsAccepted")}
            onCheckedChange={(checked) =>
              form.setValue("termsAccepted", checked === true)
            }
            aria-invalid={!!form.formState.errors.termsAccepted}
          />
          <label
            htmlFor="client-terms"
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
          disabled={registerClient.isPending}
          className="w-full"
        >
          {registerClient.isPending && <LoaderCircle className="size-4 animate-spin" />}
          Create client account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

function RegisterSidePanel({ mode }: { mode: RegisterMode }) {
  const isTalent = mode === "talent";
  return (
    <div className="relative hidden md:block">
      <Image
        src={
          isTalent
            ? "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=2400&q=100&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=2400&q=100&auto=format&fit=crop"
        }
        alt={isTalent ? "Professional woman working as talent" : "Business professionals shaking hands in an office"}
        fill
        sizes="(min-width: 768px) 55vw, 100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/85" />
      <div className="absolute inset-x-0 top-0 p-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {isTalent ? "Create your talent account" : "Create your client account"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          {isTalent
            ? "Join Worker to find work and get matched with companies worldwide."
            : "Join Worker to hire verified talent from anywhere in the world."}
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
              <p className="text-xs text-white/70">
                {isTalent ? "Open roles" : "Verified talents"}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {isTalent ? "100%" : "5K+"}
              </p>
              <p className="text-xs text-white/70">
                {isTalent ? "Free to join" : "Companies hiring"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6">
        <ul className="space-y-1.5 text-sm text-white/90">
          {(isTalent
            ? [
                "Get discovered by verified employers",
                "Apply to roles in one tap",
                "Salary transparency on every job",
              ]
            : [
                "Post jobs in minutes",
                "Matched with verified candidates",
                "Contracts and payroll handled",
              ]
          ).map((point) => (
            <li key={point} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RegisterModeTabs({
  mode,
  onChange,
}: {
  mode: RegisterMode;
  onChange: (mode: RegisterMode) => void;
}) {
  const tabs: { value: RegisterMode; label: string }[] = [
    { value: "talent", label: "Talent" },
    { value: "client", label: "Client" },
  ];
  return (
    <div className="mb-8 flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            mode === tab.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={mode === tab.value}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  usePageTitle("Create Account");
  const [mode, setMode] = useState<RegisterMode>("talent");

  return (
    <AuthGuard>
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[1.2fr_1fr]">
        <RegisterSidePanel mode={mode} />
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "talent"
              ? "Create your talent account"
              : "Create your client account"}
          </h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            {mode === "talent"
              ? "Join Worker to find work and get matched with companies worldwide."
              : "Join Worker to hire verified talent from anywhere in the world."}
          </p>
          <RegisterModeTabs mode={mode} onChange={setMode} />
          {mode === "talent" ? <RegisterTalentForm /> : <RegisterClientForm />}
        </div>
      </div>
    </AuthGuard>
  );
}
