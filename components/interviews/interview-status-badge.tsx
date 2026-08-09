import { Badge } from "@/components/ui/badge";
import { INTERVIEW_STATUS } from "@/lib/constants/status";
import { INTERVIEW_STATUSES } from "@/lib/constants/enums";
import type { InterviewStatus } from "@/types/api/interviews";

const LABEL: Record<InterviewStatus, string> = Object.fromEntries(
  INTERVIEW_STATUSES.map((s) => [s.value, s.label])
) as Record<InterviewStatus, string>;

export function InterviewStatusBadge({
  status,
}: {
  status: InterviewStatus;
}) {
  return (
    <Badge className={INTERVIEW_STATUS[status] ?? undefined}>
      {LABEL[status] ?? status}
    </Badge>
  );
}
