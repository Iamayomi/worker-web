"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackButton = ({ className = "" }) => {
  const router = useRouter();

  return (
    <div className={`text-grey-normal flex mb-8 ${className}`}>
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="cursor-pointer"
      >
        <ChevronLeft size={24} />
        <p className="text-sm">Go Back</p>
      </Button>
    </div>
  );
};

export default BackButton;
