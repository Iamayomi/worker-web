import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  CertificationData,
  CertificationInput,
  EducationData,
  EducationInput,
  WorkExperienceData,
  WorkExperienceInput,
} from "@/types/api/talent";

interface ListEnvelope<T> {
  items: T[];
}

function useList<T>(queryKey: readonly unknown[], path: string) {
  return useQuery({
    queryKey,
    retry: false,
    queryFn: async () => {
      const res = await worker.auth.get<ListEnvelope<T>>(path);
      if (!res.success) throw new Error(res.message || "Failed to load");
      return res.data?.items ?? [];
    },
  });
}

function usePublicList<T>(
  queryKey: readonly unknown[],
  path: string,
  enabled: boolean
) {
  return useQuery({
    queryKey,
    enabled,
    retry: false,
    queryFn: async () => {
      const res = await worker.get<ListEnvelope<T>>(path);
      if (!res.success) throw new Error(res.message || "Failed to load");
      return res.data?.items ?? [];
    },
  });
}

function useEntryMutations<TInput>(path: string, key: readonly unknown[]) {
  const queryClient = useQueryClient();
  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: async (data: TInput) => {
      const res = await worker.auth.post<unknown>(path, data);
      if (!res.success) throw new Error(res.message || "Failed to save");
      return res.data;
    },
    onSuccess: invalidateList,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: TInput & { id: string }) => {
      const res = await worker.auth.patch<unknown>(`${path}/${id}`, data);
      if (!res.success) throw new Error(res.message || "Failed to save");
      return res.data;
    },
    onSuccess: invalidateList,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.delete<{ removed: boolean }>(
        `${path}/${id}`
      );
      if (!res.success) throw new Error(res.message || "Failed to remove");
      return res.data;
    },
    onSuccess: invalidateList,
  });

  return { add, update, remove };
}

function useAdminEntryMutations<TInput>(
  path: string,
  talentProfileId: string,
  key: readonly unknown[]
) {
  const queryClient = useQueryClient();
  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: key });

  const add = useMutation({
    mutationFn: async (data: TInput) => {
      const res = await worker.auth.post<unknown>(`${path}/admin`, {
        ...data,
        talentProfileId,
      });
      if (!res.success) throw new Error(res.message || "Failed to save");
      return res.data;
    },
    onSuccess: invalidateList,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: TInput & { id: string }) => {
      const res = await worker.auth.patch<unknown>(`${path}/admin/${id}`, {
        ...data,
        talentProfileId,
      });
      if (!res.success) throw new Error(res.message || "Failed to save");
      return res.data;
    },
    onSuccess: invalidateList,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await worker.auth.delete<{ removed: boolean }>(
        `${path}/admin/${id}`,
        { talentProfileId }
      );
      if (!res.success) throw new Error(res.message || "Failed to remove");
      return res.data;
    },
    onSuccess: invalidateList,
  });

  return { add, update, remove };
}

export function useMyWorkExperiences() {
  return useList<WorkExperienceData>(
    queryKeys.profiles.experiences(),
    "/talent-experience"
  );
}

export function usePublicWorkExperiences(talentProfileId: string) {
  return usePublicList<WorkExperienceData>(
    queryKeys.profiles.publicExperiences(talentProfileId),
    `/talent-experience/talent/${talentProfileId}`,
    Boolean(talentProfileId)
  );
}

export function useAddWorkExperience() {
  return useEntryMutations<WorkExperienceInput>(
    "/talent-experience",
    queryKeys.profiles.experiences()
  ).add;
}

export function useUpdateWorkExperience() {
  return useEntryMutations<WorkExperienceInput>(
    "/talent-experience",
    queryKeys.profiles.experiences()
  ).update;
}

export function useRemoveWorkExperience() {
  return useEntryMutations<WorkExperienceInput>(
    "/talent-experience",
    queryKeys.profiles.experiences()
  ).remove;
}

export function useMyEducations() {
  return useList<EducationData>(
    queryKeys.profiles.education(),
    "/talent-education"
  );
}

export function usePublicEducations(talentProfileId: string) {
  return usePublicList<EducationData>(
    queryKeys.profiles.publicEducation(talentProfileId),
    `/talent-education/talent/${talentProfileId}`,
    Boolean(talentProfileId)
  );
}

export function useAddEducation() {
  return useEntryMutations<EducationInput>(
    "/talent-education",
    queryKeys.profiles.education()
  ).add;
}

export function useUpdateEducation() {
  return useEntryMutations<EducationInput>(
    "/talent-education",
    queryKeys.profiles.education()
  ).update;
}

export function useRemoveEducation() {
  return useEntryMutations<EducationInput>(
    "/talent-education",
    queryKeys.profiles.education()
  ).remove;
}

export function useMyCertifications() {
  return useList<CertificationData>(
    queryKeys.profiles.certifications(),
    "/talent-cert"
  );
}

export function usePublicCertifications(talentProfileId: string) {
  return usePublicList<CertificationData>(
    queryKeys.profiles.publicCertifications(talentProfileId),
    `/talent-cert/talent/${talentProfileId}`,
    Boolean(talentProfileId)
  );
}

export function useAddCertification() {
  return useEntryMutations<CertificationInput>(
    "/talent-cert",
    queryKeys.profiles.certifications()
  ).add;
}

export function useUpdateCertification() {
  return useEntryMutations<CertificationInput>(
    "/talent-cert",
    queryKeys.profiles.certifications()
  ).update;
}

export function useRemoveCertification() {
  return useEntryMutations<CertificationInput>(
    "/talent-cert",
    queryKeys.profiles.certifications()
  ).remove;
}

export function useAdminWorkExperiences(talentProfileId: string) {
  return useAdminEntryMutations<WorkExperienceInput>(
    "/talent-experience",
    talentProfileId,
    queryKeys.profiles.publicExperiences(talentProfileId)
  );
}

export function useAdminEducations(talentProfileId: string) {
  return useAdminEntryMutations<EducationInput>(
    "/talent-education",
    talentProfileId,
    queryKeys.profiles.publicEducation(talentProfileId)
  );
}

export function useAdminCertifications(talentProfileId: string) {
  return useAdminEntryMutations<CertificationInput>(
    "/talent-cert",
    talentProfileId,
    queryKeys.profiles.publicCertifications(talentProfileId)
  );
}
