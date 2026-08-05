import type { Metadata } from "next";
import { ManagedPage } from "@/components/content/managed-page";

export const metadata: Metadata = {
  title: "Community — Worker",
};

export default function CommunityPage() {
  return <ManagedPage slug="community" />;
}
