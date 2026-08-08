"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, LoaderCircle, Upload } from "lucide-react";
import { useUploadDocument } from "@/lib/hooks/use-users";
import { Button } from "@/components/ui/button";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 10 * 1024 * 1024;

export function DocumentUpload({ label = "Upload a document" }: { label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDocument();
  const [lastFileName, setLastFileName] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Allowed: PDF, JPEG, PNG");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File size exceeds 10MB limit");
      return;
    }
    setLastFileName(null);
    upload.mutate(file, {
      onSuccess: () => {
        setLastFileName(file.name);
        toast.success("Document upload started. It will appear on your profile once processed.");
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Upload failed"),
    });
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpeg,.jpg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={upload.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {upload.isPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {label}
        </Button>
        {lastFileName && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {lastFileName} · queued
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        PDF, JPEG or PNG up to 10MB.
      </p>
    </div>
  );
}
