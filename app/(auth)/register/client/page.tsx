"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Check, LoaderCircle, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useRegisterClient } from "@/hooks/api/useAuth";
import {
  AccountType,
  type RegisterClientDto,
} from "@/types/api/auth";
import {
  COMPANY_SIZE_OPTIONS,
  COUNTRIES,
  INDUSTRY_OPTIONS,
} from "@/lib/constants/options";
import { passwordSchema } from "@/schemas";

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

export default function RegisterClientPage() {
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

  return (
    <AuthGuard>
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[1.2fr_1fr]">
        <div className="relative hidden md:block">
          <Image
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=90&auto=format&fit=crop"
            alt="Black business professionals shaking hands in an office"
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/85" />
          <div className="absolute inset-x-0 top-0 p-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Create your client account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Join Worker to hire verified talent from anywhere in the world.
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
                  <p className="text-xs text-white/70">Verified talents</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">5K+</p>
                  <p className="text-xs text-white/70">Companies hiring</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6">
            <ul className="space-y-1.5 text-sm text-white/90">
              {["Post jobs in minutes", "Matched with verified candidates", "Contracts and payroll handled"].map((point) => (
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
                <h1 className="text-2xl font-bold tracking-tight">Create your client account</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Join Worker to hire verified talent from anywhere in the world.
                </p>
              </div>

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
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="you@company.com"
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
                  <Label htmlFor="client-password">
                    Password<span className="text-foreground"> *</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="client-password"
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="client-phone">
                      Phone number<span className="text-foreground"> *</span>
                    </Label>
                    <Input
                      id="client-phone"
                      type="tel"
                      placeholder="+234..."
                      {...form.register("phone")}
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
                Looking for work?{" "}
                <Link href="/register/talent" className="font-medium text-primary hover:underline">
                  Create a talent account
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
