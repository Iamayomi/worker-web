import type { Metadata } from "next";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms & Conditions — Worker",
  description: "Terms and conditions for using the Worker platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account or using the Worker platform, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you may not use the platform.",
  },
  {
    title: "2. Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate and complete information when registering and to keep your profile up to date. You must be at least 18 years old to use the platform.",
  },
  {
    title: "3. Talent and Client Roles",
    body: "Worker connects verified talent with clients hiring worldwide. Talent agree to represent their skills, experience, and qualifications accurately. Clients agree to post genuine opportunities and treat candidates fairly and lawfully.",
  },
  {
    title: "4. Acceptable Use",
    body: "You agree not to misuse the platform, including attempting to access another user's account, scraping data, transmitting harmful code, or using the platform for unlawful purposes. We may suspend or terminate accounts that violate these rules.",
  },
  {
    title: "5. Fees and Payments",
    body: "Certain services, such as payroll processing and contracts, may involve fees. Any applicable fees will be disclosed before you commit to a transaction. Where Worker handles contracts and payroll, additional terms specific to those services may apply.",
  },
  {
    title: "6. Intellectual Property",
    body: "The Worker platform, including its design, logos, and software, is the property of Worker and its licensors. You retain ownership of the content you upload, and you grant Worker a limited license to host and display that content in connection with operating the platform.",
  },
  {
    title: "7. Termination",
    body: "You may close your account at any time. We may suspend or terminate access if you breach these Terms & Conditions or if required by law. Upon termination, provisions that by their nature should survive will remain in effect.",
  },
  {
    title: "8. Disclaimers and Limitation of Liability",
    body: "The platform is provided \"as is\" without warranties of any kind. To the maximum extent permitted by law, Worker is not liable for indirect, incidental, or consequential damages arising from your use of the platform.",
  },
  {
    title: "9. Changes to These Terms",
    body: "We may update these Terms & Conditions from time to time. We will notify you of material changes. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.",
  },
  {
    title: "10. Contact",
    body: "If you have questions about these Terms & Conditions, please contact our support team through the contact options on the platform.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Terms &amp; Conditions
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
              Questions about these terms? Read our{" "}
              <Link href="/privacy" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>{" "}
              or reach out to our support team.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
