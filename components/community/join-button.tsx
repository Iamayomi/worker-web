"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useJoinCommunity,
  useLeaveCommunity,
} from "@/lib/hooks/use-community";

interface JoinButtonProps {
  communityId: string;
  isMember: boolean;
  isLoading?: boolean;
}

export function JoinButton({ communityId, isMember, isLoading }: JoinButtonProps) {
  const router = useRouter();
  const join = useJoinCommunity(communityId);
  const leave = useLeaveCommunity(communityId);

  function onJoin() {
    join.mutate(undefined, {
      onSuccess: () => toast.success("Welcome to the community!"),
      onError: (error) => toast.error(error.message || "Failed to join community"),
    });
  }

  function onLeave() {
    leave.mutate(undefined, {
      onSuccess: () => {
        toast.success("You left the community");
        router.refresh();
      },
      onError: (error) => toast.error(error.message || "Failed to leave community"),
    });
  }

  if (isMember) {
    return (
      <Button variant="outline" onClick={onLeave} disabled={leave.isPending || isLoading}>
        <UserCheck className="size-4" /> Joined
      </Button>
    );
  }

  return (
    <Button onClick={onJoin} disabled={join.isPending || isLoading}>
      <UserPlus className="size-4" /> Join community
    </Button>
  );
}
