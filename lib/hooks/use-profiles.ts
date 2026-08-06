import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import { queryKeys } from "@/lib/api/query-keys";
import type { EmploymentType, WorkPreference } from "@/types/api/auth";

export interface ClientProfileData {
  id: string;
  userId: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  country?: string;
  companyDescription?: string;
  logoUrl?: string;
  contactFirstName: string;
  contactLastName: string;
  phone?: string;
  verificationStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export function useClientProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profiles.clientMe(),
    enabled,
    retry: false,
    queryFn: async () => {
      const res = await worker.auth.get<ClientProfileData>("/client-profiles/me");
      if (!res.success)
        throw new Error(res.message || "Failed to load client profile");
      return res.data!;
    },
  });
}

export interface UpdateClientProfileInput {
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  country?: string;
  companyDescription?: string;
  logoUrl?: string;
  contactFirstName?: string;
  contactLastName?: string;
  phone?: string;
}

export function useUpdateClientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateClientProfileInput) => {
      const res = await worker.auth.patch<ClientProfileData>(
        "/client-profiles/me",
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to update client profile");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.clientMe() });
    },
  });
}

export interface TalentProfileData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  country?: string;
  stateOfResidence?: string;
  gender?: string;
  phone?: string;
  professionalTitle?: string;
  bio?: string;
  yearsOfExperience?: number;
  employmentType?: EmploymentType;
  workPreference?: WorkPreference;
  skills?: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  visibility?: string;
  createdAt: string;
  updatedAt: string;
}

export function useTalentProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profiles.talentMe(),
    enabled,
    retry: false,
    queryFn: async () => {
      const res = await worker.auth.get<TalentProfileData>("/talent-profiles/me");
      if (!res.success)
        throw new Error(res.message || "Failed to load talent profile");
      return res.data!;
    },
  });
}

export function usePublicTalentProfile(id: string) {
  return useQuery({
    queryKey: ["talent-profiles", "public", id],
    enabled: Boolean(id),
    retry: false,
    queryFn: async () => {
      const res = await worker.get<TalentProfileData>(`/talent-profiles/${id}`);
      if (!res.success)
        throw new Error(res.message || "Profile not found");
      return res.data!;
    },
  });
}

export function usePublicClientProfile(id: string) {
  return useQuery({
    queryKey: ["client-profiles", "public", id],
    enabled: Boolean(id),
    retry: false,
    queryFn: async () => {
      const res = await worker.get<ClientProfileData>(
        `/client-profiles/${id}`
      );
      if (!res.success)
        throw new Error(res.message || "Company not found");
      return res.data!;
    },
  });
}

export interface UpdateTalentProfileInput {
  firstName?: string;
  lastName?: string;
  country?: string;
  stateOfResidence?: string;
  gender?: string;
  phone?: string;
  professionalTitle?: string;
  bio?: string;
  yearsOfExperience?: number;
  employmentType?: EmploymentType;
  workPreference?: WorkPreference;
  skills?: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
}

export function useUpdateTalentProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTalentProfileInput) => {
      const res = await worker.auth.patch<TalentProfileData>(
        "/talent-profiles/me",
        data
      );
      if (!res.success)
        throw new Error(res.message || "Failed to update talent profile");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.talentMe() });
    },
  });
}

export function useUpdateTalentProfileVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visibility: "public" | "private") => {
      const res = await worker.auth.patch<TalentProfileData>(
        "/talent-profiles/visibility",
        { visibility }
      );
      if (!res.success)
        throw new Error(res.message || "Failed to update profile visibility");
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.talentMe() });
    },
  });
}
