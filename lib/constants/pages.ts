import type { Page } from "@/types/api/pages";
import { PostStatus } from "@/types/api/posts";

function makeDefault(
  slug: string,
  title: string,
  heroTitle: string,
  heroSubtitle: string,
  sections: { heading: string; body: string; bullets?: string[] }[]
): Page {
  return {
    id: "",
    slug,
    title,
    heroTitle,
    heroSubtitle,
    sections,
    status: PostStatus.PUBLISHED,
    createdAt: "",
    updatedAt: "",
  };
}

export const DEFAULT_PAGE_CONTENT: Record<string, Page> = {
  talent: makeDefault(
    "talent",
    "Find talent",
    "Hire the best, faster",
    "Browse vetted professionals across engineering, design, marketing and more. Get matched with world-class talent in days, not months.",
    [
      {
        heading: "Why companies hire on Worker",
        body: "Worker gives you access to a global, vetted talent pool — so you can build the team you need, wherever you are.",
        bullets: [
          "Vetted, verified professionals",
          "Match in days, not months",
          "No upfront fees",
        ],
      },
      {
        heading: "How it works",
        body: "Post a role, review matched candidates, and hire. Our matching engine does the heavy lifting.",
        bullets: [
          "Post a job in minutes",
          "Get recommended matches",
          "Hire and pay securely",
        ],
      },
    ]
  ),
  community: makeDefault(
    "community",
    "Community",
    "Join a global network of professionals",
    "Connect with peers, share insights and grow together. Forums, events, mentorship and partnerships for every industry.",
    [
      {
        heading: "Connect and collaborate",
        body: "Engage with professionals across every industry. Share knowledge, find mentors and build meaningful partnerships.",
        bullets: [
          "Industry forums and discussions",
          "Live events and webinars",
          "1-on-1 mentorship",
        ],
      },
      {
        heading: "Grow with the community",
        body: "Whether you are just starting out or scaling your team, the Worker community has your back.",
        bullets: [
          "Networking with global peers",
          "Exclusive career resources",
          "Partner opportunities",
        ],
      },
    ]
  ),
  about: makeDefault(
    "about",
    "About",
    "The global marketplace for work",
    "Worker connects talented people with world-class teams. We believe great work should have no borders.",
    [
      {
        heading: "Our mission",
        body: "We are building the most trusted global marketplace for work — where anyone, anywhere can find opportunity and build a fulfilling career.",
      },
      {
        heading: "What we value",
        body: "Trust, quality and opportunity drive every decision we make.",
        bullets: [
          "Vetted talent on every profile",
          "Fair, transparent matching",
          "Opportunity without borders",
        ],
      },
    ]
  ),
  pricing: makeDefault(
    "pricing",
    "Pricing",
    "Simple, transparent pricing",
    "Start free and pay only when you hire. No hidden fees, no lock-in.",
    [
      {
        heading: "For talent",
        body: "Creating a profile and browsing jobs is always free.",
        bullets: [
          "Free profile creation",
          "Unlimited job browsing",
          "No cost to apply",
        ],
      },
      {
        heading: "For companies",
        body: "Post jobs free. Pay a success fee only when you hire.",
        bullets: [
          "Free job posts",
          "Success fee on hire",
          "Cancel anytime",
        ],
      },
    ]
  ),
};
