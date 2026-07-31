import type { LucideIcon } from "lucide-react";

export type ExperiencePageContent = {
  hero: {
    eyebrow: string;
    title: string;
    description?: string;
    operatingNote?: string;
  };
  items: Array<{
    id: string;
    period: string;
    role: string;
    websiteUrl?: string;
    summary?: string;
    signals: string[];
    order: number;
  }>;
};

export type BuildsPageContent = {
  hero: {
    eyebrow: string;
    title: string;
    description?: string;
  };
  items: Array<{
    id: string;
    title: string;
    category: string;
    status: "active" | "in-progress";
    summary?: string;
    proofNote?: string;
    githubUrl?: string;
    liveUrl?: string;
    stack: string[];
    featured: boolean;
    order: number;
  }>;
};

export type ResolvedExperienceItem = ExperienceItem;
export type ResolvedBuildItem = BuildItem;

export type NavItem = {
  href: string;
  label: string;
  code: string;
};

export type SocialLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type ProfileInfo = {
  name: string;
  handle: string;
  role: string;
  status: string;
  location: string;
  availability: string;
  intro: string;
  summary: string;
  stats: {
    label: string;
    value: string;
    note: string;
  }[];
};

export type SkillGroup = {
  title: string;
  skills: string[];
};

export type ExperienceItem = {
  index: string;
  role: string;
  period: string;
  websiteUrl?: string;
  summary: string;
  signals: string[];
};

export type BuildItem = {
  index: string;
  name: string;
  category: string;
  status: "active" | "in-progress";
  description: string;
  stack: string[];
  proof: string;
  githubHref?: string;
  liveHref?: string;
};

export type NoteItem = {
  index: string;
  slug: string;
  title: string;
  date: string;
  readTime: string;
  status: "drafting" | "planned" | "published";
  excerpt: string;
  body: string[];
};

export type ExtraItem = {
  title: string;
  note: string;
  color: string;
};
