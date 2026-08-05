import type { Metadata } from "next";
import { ManagedPage } from "@/components/content/managed-page";

export const metadata: Metadata = {
  title: "Pricing — Worker",
};

export default function PricingPage() {
  return <ManagedPage slug="pricing" />;
}
