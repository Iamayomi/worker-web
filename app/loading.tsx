import { PageShell } from "@/components/common/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <div className="border-y border-border/20 py-16">
        <p className="font-sketch text-4xl font-bold text-primary">
          Loading...
        </p>
        <div className="mt-6 h-3 w-64 animate-pulse bg-accent" />
        <div className="mt-3 h-3 w-40 animate-pulse bg-secondary" />
      </div>
    </PageShell>
  );
}
