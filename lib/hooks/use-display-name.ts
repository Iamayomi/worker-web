import { useAuth } from "@/lib/auth/auth-context";
import { useClientProfile, useTalentProfile } from "@/lib/hooks/use-profiles";

export function useDisplayName(): string {
  const { user } = useAuth();
  const accountType = user?.accountType;

  const client = useClientProfile(accountType === "client");
  const talent = useTalentProfile(accountType === "talent");

  if (accountType === "client") {
    const p = client.data;
    if (p?.companyName) return p.companyName;
    const first = p?.contactFirstName?.trim();
    const last = p?.contactLastName?.trim();
    if (first || last) return `${first ?? ""} ${last ?? ""}`.trim();
  }

  if (accountType === "talent") {
    const p = talent.data;
    const first = p?.firstName?.trim();
    const last = p?.lastName?.trim();
    if (first || last) return `${first ?? ""} ${last ?? ""}`.trim();
  }

  return "";
}
