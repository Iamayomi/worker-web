import type { Metadata } from "next";

import { PageShell } from "@/components/common/page-shell";
import { SectionHeading } from "@/components/common/section-heading";
import { getContactContent } from "@/lib/api/pages";
import { pageIntros } from "@/lib/fallbacks/portfolio-data";
import { ContactAside } from "./_components/contact-aside";
import { ContactForm } from "./_components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Ayomide Amodu for backend engineering, API architecture, and scalable system development projects.",

  alternates: {
    canonical: "/contact",
  },
};

export const revalidate = 900;

export default async function ContactPage() {
  const response = await getContactContent();
  const contact = response?.data;
  const intro = contact?.hero
    ? {
        icon: pageIntros.contact.icon,
        eyebrow: contact.hero.eyebrow,
        heading: contact.hero.title,
        description: contact.hero.description || pageIntros.contact.description,
      }
    : pageIntros.contact;

  return (
    <PageShell>
      <SectionHeading {...intro} tag="HOLA" />
      <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ContactForm cvUrl={contact?.cvUrl} />
        <ContactAside
          helperNote={contact?.helperNote}
          socials={contact?.socials}
        />
      </section>
    </PageShell>
  );
}
