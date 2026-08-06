"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

interface CompanyLinkProps {
  clientProfileId: string;
  companyName: string;
  className?: string;
}

export function CompanyLink({
  clientProfileId,
  companyName,
  className,
}: CompanyLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/companies/${clientProfileId}`);
  };

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/companies/${clientProfileId}`);
        }
      }}
      className={`inline-flex cursor-pointer items-center gap-1 hover:text-foreground hover:underline ${className ?? ""}`}
    >
      <Building2 className="h-3.5 w-3.5" />
      {companyName}
    </span>
  );
}
