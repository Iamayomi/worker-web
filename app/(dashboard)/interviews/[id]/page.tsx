"use client";

import { useParams } from "next/navigation";
import { InterviewDetail } from "@/components/interviews/interview-detail";

export default function InterviewDetailPage() {
 const params = useParams<{ id: string }>();
 return <InterviewDetail id={params.id} />;
}
