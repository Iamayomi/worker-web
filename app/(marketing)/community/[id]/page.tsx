import type { Metadata } from "next";
import { CommunityDetail } from "@/components/community/community-detail";

export const metadata: Metadata = {
  title: "Community — Worker",
};

export default async function CommunityIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommunityDetail communityId={id} />;
}
