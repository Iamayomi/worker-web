import type { Metadata } from "next";

import { BASE_URL, VERSION } from "../constants";

const siteName = "Amodu Ayomide";
const title = "Backend Engineer Portfolio";
const description =
  "Backend Engineer building scalable, secure, and high-performance backend systems and cloud-native applications.";

const ogImage = `/seo/opengraph-image.png?v=${VERSION}`;

export const seoMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: title,
    template: `%s | ${siteName}`,
  },

  description,

  applicationName: siteName,

  authors: [
    {
      name: siteName,
      url: BASE_URL,
    },
  ],

  creator: siteName,

  publisher: siteName,

  alternates: {
    canonical: BASE_URL,
  },

  openGraph: {
    title,
    description,
    url: BASE_URL,
    siteName,
    type: "website",
    locale: "en_NG",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Amodu Ayomide — Backend Engineer portfolio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@ayonz__",
    images: [ogImage],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  keywords: [
    "Amodu Ayomide",
    "Ayomide Amodu",
    "ayonz",
    "Backend Engineer",
    "Backend Developer",
    "Node.js Developer",
    "NestJS Developer",
    "TypeScript Developer",
    "Microservices Architecture",
    "API Design",
    "Distributed Systems",
    "Cloud-native Applications",
    "AWS",
    "Docker",
    "PostgreSQL",
    "MongoDB",
    "gRPC",
    "NATS",
    "developer portfolio Nigeria",
  ],

  category: "Technology",

  other: {
    "profile:first_name": "Ayomide",
    "profile:last_name": "Amodu",
    "profile:username": "ayonz",
  },
};
