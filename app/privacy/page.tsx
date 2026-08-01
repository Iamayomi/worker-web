import type { Metadata } from "next";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Worker",
  description: "How Worker collects, uses, and protects your personal data.",
};

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide when you create an account or use the platform, including your name, email address, phone number, country, professional details, and company information. We also collect limited technical data such as IP address, device information, and usage data to operate and secure the platform.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to create and manage your account, verify your identity and email address, match talent with clients, process contracts and payroll, provide customer support, and improve the platform. We may use your contact details to send service updates and, with your consent, marketing communications.",
  },
  {
    title: "3. Data We Share",
    body: "Your profile information is shared with clients or talent as needed to enable hiring and matching. We do not sell your personal data. We may share information with service providers who help us operate the platform, and we may disclose information when required by law or to protect the rights and safety of our users.",
  },
  {
    title: "4. Data Security",
    body: "We use industry-standard safeguards to protect your personal data, including encryption in transit and at rest, and secure access controls. While we work to protect your data, no method of transmission or storage is completely secure.",
  },
  {
    title: "5. Data Retention",
    body: "We retain your personal data for as long as your account is active or as needed to provide our services, comply with legal obligations, and resolve disputes. You may request deletion of your account and associated data at any time.",
  },
  {
    title: "6. Your Rights",
    body: "Depending on your location, you may have rights to access, correct, or delete your personal data, restrict or object to certain processing, and request a copy of your data in a portable format. You can exercise these rights by contacting us through the platform.",
  },
  {
    title: "7. Cookies and Tracking",
    body: "We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the platform is used. You can control cookies through your browser settings, though some features may not work without them.",
  },
  {
    title: "8. International Transfers",
    body: "As a global platform, your data may be processed in countries outside your own. We take appropriate safeguards, including standard contractual clauses where required, to protect your information when it is transferred internationally.",
  },
  {
    title: "9. Children's Privacy",
    body: "The platform is not intended for individuals under the age of 18. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us so we can remove it.",
  },
  {
    title: "10. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Material changes will be communicated through the platform. Your continued use after changes take effect constitutes acceptance of the updated policy.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: August 2026
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold tracking-tight">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-border bg-muted/50 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              To learn more about the rules governing the platform, read our{" "}
              <Link href="/terms" className="font-medium text-primary hover:underline">
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
