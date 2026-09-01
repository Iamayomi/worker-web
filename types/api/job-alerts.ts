export interface JobAlert {
  id: string;
  role: string | null;
  location: string | null;
  country: string | null;
  salaryMin: number | null;
  currency: string | null;
  skills: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListJobAlertsData {
  alerts: JobAlert[];
}

export interface CreateJobAlertInput {
  role?: string;
  location?: string;
  country?: string;
  salaryMin?: number;
  currency?: string;
  skills?: string[];
  active?: boolean;
}

export type UpdateJobAlertInput = Partial<CreateJobAlertInput>;

export interface JobAlertMutationData {
  id: string;
  active: boolean;
}