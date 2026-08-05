import type { Metadata } from "next";
import { ManagedPage } from "@/components/content/managed-page";

export const metadata: Metadata = {
  title: "About — Worker",
};

export default function AboutPage() {
  return <ManagedPage slug="about" />;
}
