import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(true),
});

export const registerTalentSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  country: z.string().min(1, "Country is required"),
  termsAccepted: z.boolean().refine((v) => v, {
    message: "You must accept the Terms & Conditions and Privacy Policy",
  }),
});

export const registerClientSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  company_name: z.string().min(1, "Company name is required"),
  termsAccepted: z.boolean().refine((v) => v, {
    message: "You must accept the Terms & Conditions and Privacy Policy",
  }),
});

export const registerPartnerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  organization_name: z.string().min(1, "Organization name is required"),
  termsAccepted: z.boolean().refine((v) => v, {
    message: "You must accept the Terms & Conditions and Privacy Policy",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  termsAccepted: z.boolean().refine((v) => v, {
    message: "You must accept the Terms & Conditions and Privacy Policy",
  }),
});

