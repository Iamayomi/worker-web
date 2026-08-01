import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizes = { sm: "h-5 w-5 border-2", md: "h-8 w-8 border-[3px]", lg: "h-12 w-12 border-4" };
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={cn("animate-spin rounded-full border-primary border-t-transparent", sizes[size], className)}
      />
    </div>
  );
}
