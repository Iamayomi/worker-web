"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, LoaderCircle } from "lucide-react";
import { useUploadAvatar } from "@/lib/hooks/use-users";
import { useAuth } from "@/lib/auth/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  avatarUrl?: string;
  fallback: string;
  className?: string;
  size?: number;
  onUploaded?: () => void;
}

export function AvatarUpload({
  avatarUrl,
  fallback,
  className,
  size = 80,
  onUploaded,
}: AvatarUploadProps) {
  const upload = useUploadAvatar();
  const { refreshUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    upload.mutate(file, {
      onSuccess: (res) => {
        toast.success(res?.message ?? "Picture upload queued for processing");
        setTimeout(() => void refreshUser(), 2000);
        setTimeout(() => void refreshUser(), 6000);
        setTimeout(() => {
          setPreview(null);
          URL.revokeObjectURL(objectUrl);
          onUploaded?.();
        }, 6000);
      },
      onError: (err) => {
        setPreview(null);
        URL.revokeObjectURL(objectUrl);
        toast.error(
          err instanceof Error ? err.message : "Failed to upload picture"
        );
      },
    });
  };

  const busy = upload.isPending;

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={busy}
      className={cn(
        "group relative block rounded-full",
        !busy && "cursor-pointer",
        className
      )}
      aria-label="Change profile picture"
    >
      <Avatar
        className="relative rounded-full"
        style={{ width: size, height: size }}
      >
        <AvatarImage
          src={preview ?? avatarUrl ?? undefined}
          alt="Profile picture"
          className="object-cover"
        />
        <AvatarFallback className="text-lg font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>
      {busy ? (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white">
          <LoaderCircle className="h-5 w-5 animate-spin" />
        </span>
      ) : (
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-full bg-black/50 py-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="size-3.5" />
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFile}
        disabled={busy}
      />
    </button>
  );
}
