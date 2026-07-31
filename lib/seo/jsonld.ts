import { BASE_URL, VERSION } from "../constants";

const ogImage = `${BASE_URL}/seo/opengraph-image.png?v=${VERSION}`;

export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",

  name: "Amodu Ayomide",
  alternateName: [
    "Ayonz",
    "Ayomide",
    "Ayo"
  ],
  url: BASE_URL,
  logo: `${BASE_URL}/avatar.png`,
  image: ogImage,

  jobTitle: "Backend Engineer",
  description:
    "Amodu Ayomide is a Backend Engineer focused on designing, building, and maintaining scalable, secure, and high-performance backend systems and cloud-native applications.",

  nationality: {
    "@type": "Country",
    name: "Nigeria",
  },

  address: {
    "@type": "PostalAddress",
    addressCountry: "NG",
  },

  knowsAbout: [
    "Backend development",
    "API architecture",
    "Distributed systems",
    "Microservices",
    "Node.js",
    "NestJS",
    "Express.js",
    "TypeScript",
    "Python",
    "PostgreSQL",
    "MongoDB",
    "gRPC",
    "NATS",
    "AWS",
    "Docker",
    "Cloud-native applications",
    "Database optimization",
    "Security best practices",
  ],

  sameAs: [
    "https://github.com/Iamayomi",
    "https://x.com/ayonz__",
    "https://www.linkedin.com/in/ayomide-amodu-72b035243/",
  ],

  mainEntityOfPage: {
    "@type": "WebSite",
    name: "Amodu Ayomide",
    url: BASE_URL,
    description:
      "Portfolio, selected work, and technical writing by Amodu Ayomide, a Backend Engineer building scalable backend systems and cloud-native applications.",
    inLanguage: "en-NG",
    publisher: {
      "@type": "Person",
      name: "Amodu Ayomide",
      url: BASE_URL,
    },
  },
};
