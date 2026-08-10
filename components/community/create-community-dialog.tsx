"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCommunity } from "@/lib/hooks/use-community";
import {
  CommunityVisibility,
  type CreateCommunityInput,
} from "@/types/api/community";

export function CreateCommunityDialog() {
  const router = useRouter();
  const createCommunity = useCreateCommunity();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateCommunityInput>({
    name: "",
    description: "",
    visibility: CommunityVisibility.PUBLIC,
  });

  function submit() {
    const name = form.name.trim();
    if (!name) return;
    createCommunity.mutate(
      {
        ...form,
        name,
      },
      {
        onSuccess: (community) => {
          toast.success("Community created");
          setOpen(false);
          setForm({ name: "", description: "", visibility: CommunityVisibility.PUBLIC });
          router.push(`/community/${community.id}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create community");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a community</DialogTitle>
          <DialogDescription>
            Bring people together around a shared interest, industry, or cause.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormInput
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Frontend Engineers"
          />
          <FormTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What is this community about?"
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Visibility</label>
            <Select
              value={form.visibility}
              onValueChange={(value: CommunityVisibility) =>
                setForm({ ...form, visibility: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CommunityVisibility.PUBLIC}>Public</SelectItem>
                <SelectItem value={CommunityVisibility.PRIVATE}>Private</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Private communities are visible only to members.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createCommunity.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={!form.name.trim() || createCommunity.isPending}
            >
              {createCommunity.isPending ? "Creating…" : "Create community"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
