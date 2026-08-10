"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormTextarea } from "@/components/ui/form-textarea";
import { FormInput } from "@/components/ui/form-input";
import { useCreatePost } from "@/lib/hooks/use-community";

interface CreatePostDialogProps {
  communityId: string;
}

export function CreatePostDialog({ communityId }: CreatePostDialogProps) {
  const createPost = useCreatePost(communityId);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  function submit() {
    const trimmed = content.trim();
    if (!trimmed) return;
    createPost.mutate(
      {
        content: trimmed,
        mediaUrls: mediaUrl.trim() ? [mediaUrl.trim()] : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Post published");
          setOpen(false);
          setContent("");
          setMediaUrl("");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create post");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PenSquare className="size-4" /> New post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
          <DialogDescription>
            Share an update, ask a question, or start a discussion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormTextarea
            label="Content"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-28"
          />
          <FormInput
            label="Image URL (optional)"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://…"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createPost.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={!content.trim() || createPost.isPending}
            >
              {createPost.isPending ? "Posting…" : "Publish"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
