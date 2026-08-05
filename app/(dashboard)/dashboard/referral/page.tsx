"use client";

import { AnimatedContent } from "@/components/shared/animated-content";
import { PageHeader } from "@/components/shared/page-header";
import { ReferralSubNav } from "@/components/referral/referral-sub-nav";
import { ReferralSummarySection } from "@/components/referral/referral-summary";

export default function ReferralPage() {
  return (
    <AnimatedContent className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Referral program"
        description="Share your referral code and earn rewards when referrals join."
      />

      <ReferralSubNav />

      <ReferralSummarySection />
    </AnimatedContent>
  );
}
