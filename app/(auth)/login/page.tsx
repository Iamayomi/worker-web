"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleSignInButton } from "@/components/google-sign-in";
import { AuthGuard } from "@/components/auth-guard";
import { useLogin } from "@/hooks/api/useAuth";
import { loginFormSchema } from "@/schemas";
import { getDashboardRoute } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const login = useLogin();

  const watchedPassword = form.watch("password");

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: (response) => {
        toast.success(response.message || "Login successful");
        form.reset();
        if (response.data.temp_password) {
          router.push("/reset-password");
        } else {
          const redirect = new URLSearchParams(window.location.search).get("redirect");
          router.push(redirect || getDashboardRoute(response.data.user));
        }
      },
      onError: (error) => {
        const message =
          error instanceof AxiosError
            ? (error.response?.data?.message as string) ||
              error.response?.data?.error?.message ||
              "Login failed"
            : "Something went wrong. Please try again.";
        toast.error(message);
      },
    });
  });

  return (
    <AuthGuard>
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[1.2fr_1fr]">
        <div className="relative hidden md:block">
          <Image
            src="https://images.unsplash.com/photo-1779896412119-125f2ea53fbc?w=1600&q=90&auto=format&fit=crop"
            alt="Two smiling women looking at a smartphone outdoors"
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/85" />
          <div className="absolute inset-x-0 top-0 p-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Sign in to continue searching for your perfect match — or get discovered by companies
              around the world.
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
                  <p className="text-xs text-white/70">Companies</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">1M+</p>
                  <p className="text-xs text-white/70">Talents</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6">
            <ul className="space-y-1.5 text-sm text-white/90">
              {["Access verified talent worldwide", "Get matched with the right roles", "Track applications from anywhere"].map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your Worker account to continue.
            </p>
          </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="pl-9 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              checked={form.watch("rememberMe")}
              onCheckedChange={(checked) =>
                form.setValue("rememberMe", checked === true)
              }
            />
            <label
              htmlFor="remember-me"
              className="text-sm text-muted-foreground"
            >
              Keep me signed in
            </label>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!watchedPassword || login.isPending}
            className="w-full"
          >
            {login.isPending && <LoaderCircle className="size-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </Form>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            or continue with Google
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <GoogleSignInButton />
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
        </div>
      </div>
    </AuthGuard>
  );
}

