"use client";

import { Mail } from "lucide-react";
import { motion } from "framer-motion";

import { socialLinks as fallbackSocialLinks } from "@/lib/fallbacks/portfolio-data";
import type { ContactSocials } from "@/lib/types/contact";
import { getSocialLinks } from "@/lib/utils";

type ContactAsideProps = {
  helperNote?: string;
  socials?: ContactSocials;
};

export function ContactAside({ helperNote, socials }: ContactAsideProps) {
  const cmsLinks = socials ? getSocialLinks(socials) : [];
  const links = cmsLinks.length ? cmsLinks : fallbackSocialLinks;

  return (
    <aside className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
        className="border-y border-border/25 py-6"
      >
        <p className="font-sketch text-3xl font-bold text-primary">Handles</p>
        <div className="mt-5 grid gap-3">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
              data-umami-event="social_link_clicked"
              data-umami-event-link={label}
              className="group flex items-center justify-between border-b border-border/20 py-3 text-sm font-bold last:border-b-0 hover:text-primary"
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              <span className="font-sketch text-xl transition-transform group-hover:translate-x-1">
                go
              </span>
            </a>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.14, ease: "easeOut" }}
        className="relative border border-border/25 bg-card/45 p-5"
      >
        <div className="absolute right-4 top-4 h-12 w-12 rotate-6 border border-border/35 bg-secondary" />
        <Mail className="h-5 w-5 text-primary" />
        <p className="mt-5 text-sm font-semibold leading-7">
          {helperNote ||
            "A useful first message has the goal, the current state, the rough deadline, and where I can be most helpful."}
        </p>
      </motion.section>
    </aside>
  );
}
