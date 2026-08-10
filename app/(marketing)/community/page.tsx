import type { Metadata } from "next";
import { CommunityDirectory } from "@/components/community/community-directory";

export const metadata: Metadata = {
  title: "Community — Worker",
  description:
    "Join a global network of professionals. Connect with peers across every industry.",
};

export default function CommunityPage() {
  return <CommunityDirectory />;
}
