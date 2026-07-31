import {
  Boxes,
  BriefcaseBusiness,
  Code2,
  Gamepad2,
  Mail,
  Network,
  NotebookText,
  X,
} from "lucide-react";
import {
  BuildItem,
  ExperienceItem,
  ExtraItem,
  NavItem,
  NoteItem,
  ProfileInfo,
  SkillGroup,
  SocialLink,
} from "../types/experience";

export const navItems: NavItem[] = [
  { href: "/", label: "Profile", code: "home" },
  { href: "/experience", label: "Experience", code: "xp" },
  { href: "/builds", label: "Builds", code: "builds" },
  { href: "/notes", label: "Notes", code: "articles" },
  // { href: "/extra", label: "Extra", code: "extras" },
  { href: "/contact", label: "Resume", code: "contact" },
];

export const profile: ProfileInfo = {
  name: "Ayomide",
  handle: "Ayomide",
  role: "Backend Engineer building scalable, secure, and high-performance backend systems",
  status: "available",
  location: "Nigeria / remote",
  availability:
    "Open to backend engineering, API architecture, distributed systems, and cloud-native application roles",
  intro:
    "I design and build scalable backend systems, microservices, and cloud-native applications. Specialized in API architecture, distributed systems, database optimization, and third-party integrations.",
  summary:
    "I have built systems for emergency healthcare, logistics, and non-profit organizations. This site showcases my work, skills, and the engineering principles I bring to every project.",
  stats: [
    { label: "since", value: "2021", note: "backend engineering" },
    { label: "focus", value: "API", note: "architecture & systems" },
    { label: "mode", value: "Production", note: "scalable solutions" },
  ],
};

export const socialLinks: SocialLink[] = [
  { href: "https://github.com/Iamayomi", label: "GitHub", icon: Code2 },
  { href: "https://x.com/ayonz__", label: "X", icon: X },
  { href: "https://www.linkedin.com/in/ayomide-amodu-72b035243/", label: "LinkedIn", icon: Network },
  { href: "mailto:ayomidesherif2019@gmail.com", label: "Email", icon: Mail },
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Backend Development",
    skills: [
      "Node.js",
      "NestJS",
      "Express.js",
      "TypeScript",
      "Python",
      "gRPC",
      "REST APIs",
      "Microservices",
    ],
  },
  {
    title: "Database & Data",
    skills: [
      "PostgreSQL",
      "MongoDB",
      "Database Optimization",
      "Query Performance",
      "Data Modeling",
    ],
  },
  {
    title: "Cloud & DevOps",
    skills: [
      "AWS",
      "Docker",
      "Containerization",
      "CI/CD",
      "Cloud-native Applications",
    ],
  },
  {
    title: "Security & Architecture",
    skills: [
      "RBAC",
      "OAuth2",
      "JWT",
      "Input Validation",
      "System Architecture",
      "NATS Messaging",
      "Google Maps API",
    ],
  },
];

export const experience: ExperienceItem[] = [
  {
    index: "01",
    role: "Backend Engineer | Elevot",
    period: "2025 – Present",
    websiteUrl: "https://elevot-app.com/",
    summary:
      "Designed and developed the backend infrastructure for the Elevot education platform, a learning management system supporting exams, subscriptions, payments, community forums, gamification, and AI-powered learning assistance.",
    signals: [
      "Architected a modular NestJS backend following Domain-Driven Design (DDD) principles for a scalable education platform",
      "Built secure authentication and authorization using JWT and role-based access control (RBAC) for multiple user roles",
      "Designed and implemented RESTful APIs for exam management, question banks, user profiles, subscriptions, and community features",
      "Integrated Payaza payment gateway, Redis, BullMQ, and WebSockets to support secure payments, real-time notifications, and live community interactions",
      "Built engagement features including gamification (XP, badges, leaderboards) and an AI-powered learning assistant using Google Gemini",
    ],
  },
  {
    index: "02",
    role: "Backend Engineer | EMRO Ambulance",
    period: "Feb 2025 – May 2026",
    websiteUrl: "https://www.emro.com.ng",
    summary:
      "Designed and implemented microservices architecture using Node.js and TypeScript for emergency healthcare workflows including ambulance dispatch, patient records, and emergency request handling.",
    signals: [
      "Built high-performance backend services using gRPC for inter-service communication",
      "Integrated NATS messaging system for real-time event streaming",
      "Developed RESTful APIs for authentication, ride coordination, and secure hospital data exchange",
      "Implemented strong security controls including RBAC, input validation, and secure data handling",
    ],
  },
  {
    index: "03",
    role: "Backend Engineer | Hireus Logistic",
    period: "Apr 2024 – May 2025",
    websiteUrl: "https://hireuslogistics.ng/",
    summary:
      "Designed and implemented scalable RESTful APIs for authentication, ride requests, and payment processing, improving system responsiveness by ~30%.",
    signals: [
      "Developed dynamic pricing algorithms based on demand, distance, and system conditions",
      "Integrated Google Maps API for real-time location tracking and route optimization",
      "Built backend services supporting core logistics operations including trip management and payment orchestration",
      "Optimized database queries and API performance for high-concurrency ride requests",
    ],
  },
  {
    index: "04",
    role: "Backend Engineer | Zita Onyeka Foundation",
    period: "Apr 2023 – Nov 2023",
    websiteUrl: "https://www.zitaonyekafoundation.org/",
    summary:
      "Developed and maintained backend infrastructure for the foundation's website, powering administrative operations, content management, and public-facing services.",
    signals: [
      "Built secure admin dashboard with authentication, authorization, and user management",
      "Integrated Google Authenticator (TOTP-based 2FA) for administrator account security",
      "Implemented RBAC with granular permissions for different administrative roles",
      "Developed content moderation and approval workflows to streamline editorial operations",
    ],
  },
  {
    index: "05",
    role: "Backend Engineering Intern | HNG",
    period: "Jul 2022 – Sep 2022",
    summary:
      "Developed and optimized scalable RESTful APIs using Node.js and Express.js, improving application performance.",
    signals: [
      "Integrated third-party APIs to enhance platform functionality",
      "Collaborated with cross-functional teams including frontend and DevOps",
      "Ensured seamless application deployment and performance",
    ],
  },
];

export const builds: BuildItem[] = [
  {
    index: "001",
    name: "Elevot Education Platform",
    category: "Learning Management System",
    status: "active",
    description:
      "Learning management system supporting exams, subscriptions, payments, community forums, gamification, and AI-powered learning assistance.",
    stack: ["NestJS", "PostgreSQL", "Redis", "BullMQ", "WebSockets", "Docker", "Google Gemini AI"],
    proof:
      "Architected modular backend with DDD principles, real-time features, payment integration, and AI-powered learning assistant.",
    liveHref: "https://elevot-app.com/",
  },
  {
    index: "002",
    name: "EMRO Ambulance Platform",
    category: "Emergency Healthcare Microservices",
    status: "active",
    description:
      "Microservices architecture using Node.js and TypeScript for emergency workflows including ambulance dispatch, patient records management, and emergency request handling.",
    stack: ["Node.js", "TypeScript", "gRPC", "NATS", "Google Maps API"],
    proof:
      "Designed and implemented high-performance backend services for emergency healthcare operations with real-time tracking and route optimization.",
    liveHref: "https://www.emro.com.ng",
  },
  {
    index: "004",
    name: "Hireus Logistics Platform",
    category: "Logistics & Ride-sharing",
    status: "active",
    description:
      "Scalable RESTful APIs for authentication, ride requests, payment processing, and dynamic pricing algorithms for a logistics platform.",
    stack: ["Node.js", "Express.js", "Google Maps API", "PostgreSQL"],
    proof:
      "Improved system responsiveness by ~30% and reduced tracking delays by ~25% through optimized API design and real-time location services.",
    liveHref: "https://hireuslogistics.ng/",
  },
  {
    index: "005",
    name: "Zita Onyeka Foundation",
    category: "Non-profit Website & Admin",
    status: "active",
    description:
      "Backend infrastructure for foundation website with secure admin dashboard, content management, 2FA authentication, and RBAC system.",
    stack: ["Node.js", "Express.js", "MongoDB", "Google Authenticator"],
    proof:
      "Built comprehensive admin system with role-based access control, activity logging, and content moderation workflows.",
    liveHref: "https://www.zitaonyekafoundation.org/",
  },
];

export const notes: NoteItem[] = [
  {
    index: "01",
    slug: "designing-microservices-for-emergency-healthcare",
    title: "Designing Microservices for Emergency Healthcare",
    date: "Published",
    readTime: "8 min",
    status: "published",
    excerpt:
      "Lessons learned from building a microservices architecture for emergency ambulance dispatch and patient records management.",
    body: [
      "Emergency healthcare systems require reliability, low latency, and fault tolerance. When designing the EMRO Ambulance platform, I chose microservices with gRPC for inter-service communication to minimize latency in critical workflows.",
      "NATS messaging enabled real-time event streaming between dispatch units, ambulance drivers, and hospitals. The key insight was designing for failure: every service must degrade gracefully when dependencies are unavailable.",
      "Security in healthcare is non-negotiable. I implemented RBAC with granular permissions, input validation, and secure data handling aligned with sensitive healthcare data requirements.",
    ],
  },
  {
    index: "02",
    slug: "optimizing-api-performance-for-high-concurrency",
    title: "Optimizing API Performance for High-Concurrency Systems",
    date: "Published",
    readTime: "6 min",
    status: "published",
    excerpt:
      "Practical strategies for handling high-concurrency ride requests and payment processing in logistics platforms.",
    body: [
      "At Hireus Logistics, we faced challenges with high-concurrency ride requests during peak hours. The solution involved database query optimization, connection pooling, and strategic caching layers.",
      "Dynamic pricing algorithms needed to process demand, distance, and system conditions in real-time. I implemented these as isolated services with clear interfaces, making them testable and maintainable.",
      "The result was a 30% improvement in system responsiveness and 25% reduction in tracking delays through optimized API design and Google Maps API integration.",
    ],
  },
];

export function getNoteBySlug(slug: string) {
  return notes.find((note) => note.slug === slug);
}

export const pageIntros = {
  experience: {
    icon: BriefcaseBusiness,
    eyebrow: "professional timeline",
    heading: "Building scalable backend systems.",
    description:
      "From emergency healthcare microservices to logistics platforms, I design and implement backend architectures that handle real-world complexity and scale.",
  },
  builds: {
    icon: Boxes,
    eyebrow: "project notes",
    heading: "Systems I've built and shipped.",
    description:
      "A selection of backend projects showcasing microservices architecture, API design, database optimization, and cloud-native applications.",
  },
  notes: {
    icon: NotebookText,
    eyebrow: "technical writing",
    heading: "Backend engineering insights.",
    description:
      "Practical notes on API architecture, distributed systems, database optimization, and building scalable production environments.",
  },
  contact: {
    icon: Mail,
    eyebrow: "get in touch",
    heading: "Let's build something together.",
    description:
      "Whether you need backend architecture, API design, or scalable system development, I'm ready to discuss your project requirements.",
  },
  extra: {
    icon: Gamepad2,
    eyebrow: "after hours",
    heading: "The other stuff",
    description:
      "Beyond backend engineering: interests, hobbies, and the things that keep me balanced.",
  },
};

export const extraItems: ExtraItem[] = [
  {
    title: "Problem Solving",
    note: "I enjoy tackling complex technical challenges and finding elegant solutions to scalability issues.",
    color: "bg-accent/65",
  },
  {
    title: "Technical Writing",
    note: "Documenting architecture decisions and sharing knowledge through clear, practical writing.",
    color: "bg-secondary/70",
  },
  {
    title: "Open Source",
    note: "Contributing to the developer community and learning from collaborative projects.",
    color: "bg-primary/15",
  },
  {
    title: "Continuous Learning",
    note: "Staying current with cloud-native patterns, distributed systems, and modern backend architectures.",
    color: "bg-card/70",
  },
];

export const homeHighlights = [
  {
    label: "Focus",
    value: "Backend systems & API architecture",
  },
  {
    label: "Experience",
    value: "Backend systems & cloud-native applications",
  },
  {
    label: "Specialization",
    value: "Microservices, distributed systems, cloud-native",
  },
  {
    label: "Impact",
    value: "Scalable solutions for healthcare & logistics",
  },
];
