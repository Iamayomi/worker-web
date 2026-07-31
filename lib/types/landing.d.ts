type ILandingContent = {
  hero: {
    pageLabel: string;
    greeting: string;
    headline: string;
    intro: string;
    portraitImageUrl: string;
    primaryCta: {
      label: string;
      href: string;
      published?: boolean;
      variant?: "primary" | "secondary";
    };
    secondaryCta: {
      label: string;
      href: string;
      published?: boolean;
      variant?: "primary" | "secondary";
    };
    snapshots: {
      label: string;
      value: string;
    }[];
  };
  selectedWorks: {
    eyebrow: string;
    title: string;
    linkLabel: string;
    linkHref: string;
    featuredCount: number;
    items: {
      id: string;
      title: string;
      category: string;
      status?: "active" | "in-progress";
      summary?: string;
      proofNote?: string;
      githubUrl?: string;
      liveUrl?: string;
      stack: string[];
      published: boolean;
      featured: boolean;
      order?: number;
      createdAt?: string;
      updatedAt?: string;
    }[];
  };
  selectedNotes: {
    eyebrow: string;
    title: string;
    linkLabel: string;
    linkHref: string;
    featuredCount: number;
    items: {
      id: string;
      title: string;
      slug: string;
      excerpt?: string;
      bannerImage?: string;
      tags: string[];
      readTime: string;
      publishedAt: string | null;
      updatedAt: string;
    }[];
  };
  aside: {
    studyTitle: string;
    studyDescription?: string;
    studyItems: string[];
    toolboxTitle: string;
    toolboxDescription?: string;
    skillGroups: {
      title: string;
      description?: string;
      skills: string[];
    }[];
  };
};
