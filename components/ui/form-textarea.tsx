import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, required, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="text-foreground"> *</span>}
        </Label>
        <Textarea
          ref={ref}
          id={inputId}
          required={required}
          className={cn(error && "border-destructive", className)}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  },
);
FormTextarea.displayName = "FormTextarea";

export { FormTextarea };
