import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


export const inviteAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().refine((val) => {
    if (!val || val === "") return true; // Allow empty string
    return /^0\d{10}$/.test(val);
  }, "Invalid phone number format"),
  role: z.enum(["ADMIN", "SUPPORT"], { message: "Role is required" }),
});

export const updateAdminSchema = inviteAdminSchema.partial();

export const deleteAdminSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  softDelete: z.boolean().default(true),
});

// Resolvers
export const inviteAdminResolver = zodResolver(inviteAdminSchema);
export const updateAdminResolver = zodResolver(updateAdminSchema);
export const deleteAdminResolver = zodResolver(deleteAdminSchema);

export type InviteAdminFormValues = z.infer<typeof inviteAdminSchema>;
export type UpdateAdminFormValues = z.infer<typeof updateAdminSchema>;
export type DeleteAdminFormValues = z.infer<typeof deleteAdminSchema>;

