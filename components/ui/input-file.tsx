import { Input } from "@/components/ui/input";

type InputFileProps = {
  onChange?: (file: File | undefined) => void;
};

export function InputFile({ onChange, ...props }: InputFileProps) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Input
        type="file"
        className="cursor-pointer"
        {...props}
      />
    </div>
  );
}
