import type { Metadata } from "next";
import { ManagedPage } from "@/components/content/managed-page";

export const metadata: Metadata = {
  title: "Talent — Worker",
};

export default function TalentPage() {
  return <ManagedPage slug="talent" />;
}
