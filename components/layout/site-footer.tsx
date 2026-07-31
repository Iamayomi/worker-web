import Link from "next/link";

import { FooterCoffeeLink } from "@/components/layout/buy-me-coffee-link";
import { NewsletterSignup } from "@/components/common/newsletter-signup";
import { getContactContent } from "@/lib/api/pages";
import { navItems, socialLinks } from "@/lib/fallbacks/portfolio-data";
import { getSocialLinks } from "@/lib/utils";

export async function SiteFooter() {
  const contact = await getContactContent();
  const cmsLinks = getSocialLinks(contact?.data?.socials);
  const links = cmsLinks.length ? cmsLinks : socialLinks;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/15 mt-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 text-sm text-muted-foreground sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p>
            Ayomide &copy;{year} ・ A small notebook for work, learning, and next
            steps.
          </p>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap gap-3 px-1">
          <FooterCoffeeLink />
          <span className="self-center mx-4">►</span>
          <NewsletterSignup />
          <span className="self-center mx-4">►</span>
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
              data-umami-event="social_link_clicked"
              data-umami-event-link={label}
              className="inline-flex items-center gap-2 border-b border-border/40 py-1 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:text-primary"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
