import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters"),
  rememberMe: z.boolean().default(true),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export const loginFormResolver = zodResolver(loginFormSchema);

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

const passwordCompleteSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    reference: z.string({ message: "Reference is required" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });
export type PasswordCompleteValues = z.infer<typeof passwordCompleteSchema>;
export const passwordCompleteResolver = zodResolver(passwordCompleteSchema);
export { loginFormSchema, passwordCompleteSchema, passwordSchema };
