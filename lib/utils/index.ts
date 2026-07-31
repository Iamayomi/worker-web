import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  FaEnvelope,
  FaFacebookF,
  FaGithub,
  FaGlobe,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaMediumM,
  FaTelegramPlane,
  FaPinterest,
  FaSnapchat,
} from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";
import { IoLogoWhatsapp } from "react-icons/io";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeExternalHref = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  return `https://${trimmed}`;
};

export const socialConfigs: SocialConfig[] = [
  {
    key: "email",
    label: "Email",
    icon: FaEnvelope,
    baseUrl: "mailto:",
    pattern: /@/,
  },
  {
    key: "github",
    label: "GitHub",
    icon: FaGithub,
    baseUrl: "https://github.com/",
    pattern: /github\.com/i,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: FaFacebookF,
    baseUrl: "https://facebook.com/",
    pattern: /(?:facebook\.com|fb\.com)/i,
  },
  {
    key: "x",
    label: "X",
    icon: FaXTwitter,
    baseUrl: "https://x.com/",
    pattern: /(?:x\.com|twitter\.com)/i,
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: RiInstagramFill,
    baseUrl: "https://instagram.com/",
    pattern: /instagram\.com/i,
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: FaYoutube,
    baseUrl: "https://youtube.com/@",
    pattern: /(?:youtube\.com|youtu\.be)/i,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedinIn,
    baseUrl: "https://linkedin.com/in/",
    pattern: /linkedin\.com/i,
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: FaTiktok,
    baseUrl: "https://tiktok.com/@",
    pattern: /tiktok\.com/i,
  },
  {
    key: "threads",
    label: "Threads",
    icon: FaThreads,
    baseUrl: "https://threads.net/@",
    pattern: /threads\.(?:net|com)/i,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: IoLogoWhatsapp,
    baseUrl: "https://wa.me/",
    pattern: /(?:wa\.me|whatsapp\.com)/i,
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: FaTelegramPlane,
    baseUrl: "https://t.me/",
    pattern: /(?:t\.me|telegram\.me|telegram\.org)/i,
  },
  {
    key: "snapchat",
    label: "Snapchat",
    icon: FaSnapchat,
    baseUrl: "https://snapchat.com/add/",
    pattern: /snapchat\.com/i,
  },
  {
    key: "pinterest",
    label: "Pinterest",
    icon: FaPinterest,
    baseUrl: "https://pinterest.com/",
    pattern: /pinterest\.com/i,
  },
  {
    key: "website",
    label: "Website",
    icon: FaGlobe,
    baseUrl: "https://",
    pattern: /\.(?:com|dev|xyz|org|net|io|app)/i,
  },
  {
    key: "medium",
    label: "Medium",
    icon: FaMediumM,
    baseUrl: "https://medium.com/@",
    pattern: /medium\.com/i,
  },
];

const normalizeHandle = (value: string, platform: SocialPlatform) => {
  const trimmed = value.trim();

  if (platform === "whatsapp") {
    return trimmed.replace(/[^\d]/g, "");
  }

  return trimmed.replace(/^@+/, "").replace(/^\/+/, "");
};

export const normalizeSocialHref = (value: string, config: SocialConfig) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (config.key === "email") {
    return trimmed.startsWith("mailto:") ? trimmed : `mailto:${trimmed}`;
  }

  if (/^(?:https?:)?\/\//i.test(trimmed)) {
    return trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  }

  if (config.pattern.test(trimmed)) {
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }

  return `${config.baseUrl}${normalizeHandle(trimmed, config.key)}`;
};

export const getSocialLinks = <
  T extends Partial<Record<SocialPlatform, string | null | undefined>>
>(
  source?: T,
  options: { linkedinBaseUrl?: string } = {}
): SocialLink[] => {
  if (!source) return [];

  return socialConfigs.flatMap((config) => {
    const value = source[config.key];
    if (!value) return [];

    const socialConfig =
      config.key === "linkedin" && options.linkedinBaseUrl
        ? { ...config, baseUrl: options.linkedinBaseUrl }
        : config;

    return [
      {
        href: normalizeSocialHref(value, socialConfig),
        icon: socialConfig.icon,
        label: socialConfig.label,
      },
    ];
  });
};
