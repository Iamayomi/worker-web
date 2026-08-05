// CMS-managed pages API types

import type { PostStatus } from "@/types/api/posts";

export interface PageSection {
  heading?: string;
  body?: string;
  bullets?: string[];
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  sections: PageSection[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PageListData {
  pages: Page[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface CreatePageInput {
  slug: string;
  title: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  sections?: PageSection[];
  status?: PostStatus;
}

export type UpdatePageInput = Partial<CreatePageInput>;
