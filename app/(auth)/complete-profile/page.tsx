"use client";

import { useEffect, useState, Suspense, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { LoaderCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { usePageTitle } from "@/lib/hooks/use-page-title";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import {
  useCompleteTalentProfile,
  useCompleteClientProfile,
} from "@/hooks/api/useAuth";
import {
  EmploymentType,
  WorkPreference,
  AccountType,
  type CompleteTalentRegistrationDto,
  type CompleteClientRegistrationDto,
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
import { getDashboardRoute } from "@/lib/utils";

const GOOGLE_PROFILE_KEY = "worker_google_profile";

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
  resumeUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});
type TalentFormValues = z.infer<typeof talentSchema>;

const clientSchema = z.object({
  contactFirstName: z.string().min(1, "First name is required"),
  contactLastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Select an industry"),
  companySize: z.string().min(1, "Select a company size"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  companyDescription: z.string().optional(),
});
type ClientFormValues = z.infer<typeof clientSchema>;

function CompleteProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokens = useAuthStore((s) => s.tokens);
  const completeTalent = useCompleteTalentProfile();
  const completeClient = useCompleteClientProfile();

  const type =
    searchParams.get("type") === AccountType.CLIENT ? "client" : "talent";

  const accountType =
    type === "client" ? AccountType.CLIENT : AccountType.TALENT;

  const [googleProfile, setGoogleProfile] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  useEffect(() => {
    if (!tokens) {
      router.replace("/login");
    }
    try {
      const raw = window.localStorage.getItem(GOOGLE_PROFILE_KEY);
      if (raw) {
        setGoogleProfile(JSON.parse(raw));
        window.localStorage.removeItem(GOOGLE_PROFILE_KEY);
      }
    } catch {
      // ignore malformed stored profile
    }
  }, [tokens, router]);

  if (!tokens) {
    return null;
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[1.2fr_1fr]">
      <div className="hidden p-8 md:block">
        <h2 className="text-2xl font-bold tracking-tight">
          {type === "client"
            ? "Finish setting up your client account"
            : "Finish setting up your talent account"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {type === "client"
            ? "Tell us about your company so we can match you with verified talent."
            : "Tell us about your professional background so we can match you with companies."}
        </p>
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          {[
            "Your account is verified via Google",
            "No password needed — sign in with Google anytime",
            "You can update these details later from settings",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {type === "client" ? "Complete your client profile" : "Complete your talent profile"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Almost done — fill in the details below.
          </p>
        </div>

        {type === "client" ? (
          <ClientProfileForm
            defaultFirstName={googleProfile?.firstName || ""}
            defaultLastName={googleProfile?.lastName || ""}
            isPending={completeClient.isPending}
            onSubmit={(values) =>
              completeClient.mutate(
                {
                  ...values,
                  website: values.website || undefined,
                  companyDescription: values.companyDescription || undefined,
                } as CompleteClientRegistrationDto,
                {
                  onSuccess: (response) => {
                    toast.success(
                      response.message || "Client profile completed"
                    );
                    router.push(getDashboardRoute({ accountType, roles: [] }));
                  },
                  onError: (error) =>
                    toast.error(
                      errorMessage(
                        error,
                        "Failed to complete profile. Please try again."
                      )
                    ),
                }
              )
            }
          />
        ) : (
          <TalentProfileForm
            defaultFirstName={googleProfile?.firstName || ""}
            defaultLastName={googleProfile?.lastName || ""}
            isPending={completeTalent.isPending}
            onSubmit={(values) =>
              completeTalent.mutate(
                {
                  ...values,
                  stateOfResidence: values.stateOfResidence || undefined,
                  gender: values.gender || undefined,
                  phone: values.phone || undefined,
                  resumeUrl: values.resumeUrl || undefined,
                  portfolioUrl: values.portfolioUrl || undefined,
                  linkedinUrl: values.linkedinUrl || undefined,
                } as CompleteTalentRegistrationDto,
                {
                  onSuccess: (response) => {
                    toast.success(
                      response.message || "Talent profile completed"
                    );
                    router.push(getDashboardRoute({ accountType, roles: [] }));
                  },
                  onError: (error) =>
                    toast.error(
                      errorMessage(
                        error,
                        "Failed to complete profile. Please try again."
                      )
                    ),
                }
              )
            }
          />
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already done?{" "}
          <Link
            href={getDashboardRoute({ accountType, roles: [] })}
            className="font-medium text-primary hover:underline"
          >
            Go to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}

function TalentProfileForm({
  defaultFirstName,
  defaultLastName,
  isPending,
  onSubmit,
}: {
  defaultFirstName: string;
  defaultLastName: string;
  isPending: boolean;
  onSubmit: (values: TalentFormValues) => void;
}) {
  const [customTitle, setCustomTitle] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const form = useForm<TalentFormValues>({
    resolver: zodResolver(talentSchema),
    defaultValues: {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      country: "",
      stateOfResidence: "",
      gender: "",
      phone: "",
      professionalTitle: "",
      yearsOfExperience: 0,
      skills: [],
      employmentType: "",
      workPreference: "",
      resumeUrl: "",
      portfolioUrl: "",
      linkedinUrl: "",
    },
  });

  const selectedSkills = form.watch("skills") || [];
  const selectedCountry = form.watch("country");
  const stateOptions = COUNTRY_STATES[selectedCountry] || [];
  const yearsValue = form.watch("yearsOfExperience");

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      form.setValue("skills", [...selectedSkills, skill]);
    }
  };
  const removeSkill = (skill: string) =>
    form.setValue(
      "skills",
      selectedSkills.filter((s) => s !== skill)
    );
  const handleCustomSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customSkill.trim()) {
      e.preventDefault();
      addSkill(customSkill.trim());
      setCustomSkill("");
    }
  };
  const addCustomSkill = () => {
    if (customSkill.trim()) {
      addSkill(customSkill.trim());
      setCustomSkill("");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cp-first-name">
            First name<span className="text-foreground"> *</span>
          </Label>
          <Input id="cp-first-name" {...form.register("firstName")} />
          {form.formState.errors.firstName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-last-name">
            Last name<span className="text-foreground"> *</span>
          </Label>
          <Input id="cp-last-name" {...form.register("lastName")} />
          {form.formState.errors.lastName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
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
              <SelectContent className="max-h-72">
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
          <Label htmlFor="cp-phone">Phone</Label>
          <Controller
            name="phone"
            control={form.control}
            render={({ field }) => (
              <PhoneInput
                id="cp-phone"
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

      <div className="grid grid-cols-2 gap-3">
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

      <div className="grid grid-cols-2 gap-3">
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
              {Object.values(WorkPreference).map((preference) => (
                <SelectItem key={preference} value={preference}>
                  {preference}
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="cp-resume">Resume URL</Label>
          <Input id="cp-resume" placeholder="https://..." {...form.register("resumeUrl")} />
          {form.formState.errors.resumeUrl && (
            <p className="text-sm text-destructive">
              {form.formState.errors.resumeUrl.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-portfolio">Portfolio URL</Label>
          <Input id="cp-portfolio" placeholder="https://..." {...form.register("portfolioUrl")} />
          {form.formState.errors.portfolioUrl && (
            <p className="text-sm text-destructive">
              {form.formState.errors.portfolioUrl.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-linkedin">LinkedIn URL</Label>
          <Input id="cp-linkedin" placeholder="https://..." {...form.register("linkedinUrl")} />
          {form.formState.errors.linkedinUrl && (
            <p className="text-sm text-destructive">
              {form.formState.errors.linkedinUrl.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full"
      >
        {isPending && <LoaderCircle className="size-4 animate-spin" />}
        Complete profile
      </Button>
    </form>
  );
}

function ClientProfileForm({
  defaultFirstName,
  defaultLastName,
  isPending,
  onSubmit,
}: {
  defaultFirstName: string;
  defaultLastName: string;
  isPending: boolean;
  onSubmit: (values: ClientFormValues) => void;
}) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      contactFirstName: defaultFirstName,
      contactLastName: defaultLastName,
      phone: "",
      country: "",
      companyName: "",
      industry: "",
      companySize: "",
      website: "",
      companyDescription: "",
    },
  });

  const selectedCountry = form.watch("country");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cp-client-first-name">
            Contact first name<span className="text-foreground"> *</span>
          </Label>
          <Input id="cp-client-first-name" {...form.register("contactFirstName")} />
          {form.formState.errors.contactFirstName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.contactFirstName.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-client-last-name">
            Contact last name<span className="text-foreground"> *</span>
          </Label>
          <Input id="cp-client-last-name" {...form.register("contactLastName")} />
          {form.formState.errors.contactLastName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.contactLastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cp-client-phone">
            Phone number<span className="text-foreground"> *</span>
          </Label>
          <Controller
            name="phone"
            control={form.control}
            render={({ field }) => (
              <PhoneInput
                id="cp-client-phone"
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
        <Label htmlFor="cp-client-company">
          Company name<span className="text-foreground"> *</span>
        </Label>
        <Input id="cp-client-company" placeholder="Acme Corp" {...form.register("companyName")} />
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
          <Label htmlFor="cp-client-website">Website</Label>
          <Input
            id="cp-client-website"
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
          <Label htmlFor="cp-client-description">Description</Label>
          <Input
            id="cp-client-description"
            placeholder="A leading tech company..."
            {...form.register("companyDescription")}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full"
      >
        {isPending && <LoaderCircle className="size-4 animate-spin" />}
        Complete profile
      </Button>
    </form>
  );
}

export default function CompleteProfilePage() {
  usePageTitle("Complete Your Profile");
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CompleteProfile />
    </Suspense>
  );
}
