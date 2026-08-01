import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Step {
  id: number;
  title: string;
  status: "completed" | "current" | "upcoming";
}

interface StepProgressProps {
  steps: Step[];
  className?: string;
  onStepClick?: (stepId: number) => void;
}

export function StepProgress({
  steps,
  className,
  onStepClick,
}: StepProgressProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="relative flex items-start">
          {/* Vertical line connector */}
          {index < steps.length - 1 && (
            <div className="absolute left-4 top-8 h-16 w-px border-l-2 border-dashed border-muted-foreground/30" />
          )}

          {/* Step indicator */}
          <div
            className={cn(
              "flex items-center space-x-4 mb-8 font-light",
              onStepClick &&
                (step.status === "completed" || step.status === "current") &&
                "cursor-pointer hover:opacity-80 transition-opacity"
            )}
            onClick={() =>
              onStepClick &&
              (step.status === "completed" || step.status === "current") &&
              onStepClick(step.id)
            }
          >
            <Badge
              variant={
                step.status === "completed"
                  ? "default"
                  : step.status === "current"
                  ? "outline"
                  : "outline"
              }
              className={cn(
                "h-8 w-8 rounded-full p-0 flex items-center justify-center text-sm font-medium",
                step.status === "completed" &&
                  "bg-primary text-primary-foreground",
                step.status === "current" &&
                  "bg-primary text-primary-foreground border-2 border-primary",
                step.status === "upcoming" &&
                  "bg-background text-muted-foreground border-2 border-muted-foreground/30"
              )}
            >
              {step.status === "completed" ? "✓" : step.id}
            </Badge>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-primary">
                  Step {step.id}
                </span>
              </div>
              <h3
                className={cn(
                  "text-base font-semibold",
                  step.status === "upcoming" && "text-muted-foreground"
                )}
              >
                {step.title}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

