import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="text-foreground"> *</span>}
        </Label>
        <Input
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
FormInput.displayName = "FormInput";

export { FormInput };
