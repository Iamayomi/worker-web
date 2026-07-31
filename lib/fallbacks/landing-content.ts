import { profile, skillGroups } from "@/lib/fallbacks/portfolio-data";

export const fallbackLandingContent: ILandingContent = {
  hero: {
    pageLabel: "Page 01 / portfolio",
    greeting: `Hi, I'm ${profile.name}`,
    headline:
      "I'm a Backend Engineer specializing in scalable, secure, and high-performance backend systems.",
    intro: profile.intro,
    portraitImageUrl: "/dp.png",
    primaryCta: {
      label: "See my work",
      href: "/builds",
      published: true,
      variant: "primary",
    },
    secondaryCta: {
      label: "Get in touch",
      href: "/contact",
      published: true,
      variant: "secondary",
    },
    snapshots: [
      {
        label: "Experience",
        value: "Building scalable backend systems.",
      },
      {
        label: "Focus",
        value: "Scalable APIs, microservices, cloud-native apps.",
      },
      {
        label: "Open to",
        value:
          "Backend architecture, API design, and distributed systems roles.",
      },
    ],
  },
  selectedWorks: {
    eyebrow: "Selected work",
    title: "Backend systems I've built and shipped",
    linkLabel: "All projects",
    linkHref: "/builds",
    featuredCount: 2,
    items: [],
  },
  selectedNotes: {
    eyebrow: "Technical writing",
    title: "Insights on backend engineering and system design",
    linkLabel: "All notes",
    linkHref: "/notes",
    featuredCount: 2,
    items: [],
  },
  aside: {
    studyTitle: "Current Focus",
    studyDescription:
      "Building scalable backend systems with modern architectures and best practices.",
    studyItems: [
      "Microservices architecture",
      "API design patterns",
      "Database optimization",
      "Cloud-native development",
      "Security best practices",
    ],
    toolboxTitle: "Tech Stack",
    toolboxDescription:
      "The technologies I use to build, optimize, and deploy production backend systems.",
    skillGroups,
  },
};
