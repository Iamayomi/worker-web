import { Badge } from "@/components/ui/badge";

type SkillTagsProps = {
  items: string[];
};

export function SkillTags({ items }: SkillTagsProps) {
  const colors = ["bg-accent/50", "bg-secondary/60", "bg-primary/10"];

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <Badge
          key={item}
          variant="outline"
          className={`${colors[index % colors.length]} rounded-none px-2 py-0.5 text-[0.66rem] normal-case tracking-normal`}
        >
          {item}
        </Badge>
      ))}
    </div>
  );
}
