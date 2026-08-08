"use client";

import { useParams } from "next/navigation";
import { ManagedPage } from "@/components/content/managed-page";

export default function ManagedSlugPage() {
  const params = useParams<{ slug: string }>();
  return <ManagedPage slug={params?.slug ?? ""} />;
}
