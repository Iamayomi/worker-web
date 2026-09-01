export enum EmailTemplateCategory {
  TRANSACTIONAL = "transactional",
  MARKETING = "marketing",
  NOTIFICATION = "notification",
  LIFECYCLE = "lifecycle",
  BUSINESS = "business",
  SYSTEM = "system",
}

export enum EmailTemplateStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export interface EmailTemplateData {
  id: string;
  name: string;
  key: string;
  category: EmailTemplateCategory;
  subject: string;
  html_content: string;
  text_content: string | null;
  variables: string[];
  status: EmailTemplateStatus;
  created_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ListEmailTemplatesData {
  templates: EmailTemplateData[];
  total: number;
}

export interface PreviewEmailTemplateData {
  subject: string;
  html: string;
  text: string | null;
}

export interface CreateEmailTemplateInput {
  name: string;
  key: string;
  category: EmailTemplateCategory;
  subject: string;
  html_content: string;
  text_content?: string;
  status?: EmailTemplateStatus;
}

export interface UpdateEmailTemplateInput {
  name?: string;
  category?: EmailTemplateCategory;
  subject?: string;
  html_content?: string;
  text_content?: string;
  status?: EmailTemplateStatus;
}

export interface SendTestEmailInput {
  id: string;
  to: string;
  variables: Record<string, string>;
}
