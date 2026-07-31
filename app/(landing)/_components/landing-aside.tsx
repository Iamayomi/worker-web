import { MotionBlock } from "@/components/common/motion-primitives";

type LandingAsideProps = {
  content: ILandingContent["aside"];
};

export function LandingAside({ content }: LandingAsideProps) {
  return (
    <aside className="space-y-10">
      <MotionBlock>
        <p className="font-sketch text-3xl font-bold text-primary">
          {content.studyTitle}
        </p>
        {content.studyDescription ? (
          <p className="mt-3 text-sm font-semibold leading-6">
            {content.studyDescription}
          </p>
        ) : null}
        <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
          {content.studyItems.map((item) => (
            <li key={item} className="border-b border-border/15 pb-2">
              {item}
            </li>
          ))}
        </ul>
      </MotionBlock>

      <MotionBlock>
        <p className="font-sketch text-3xl font-bold text-primary">
          {content.toolboxTitle}
        </p>
        {content.toolboxDescription ? (
          <p className="mt-3 text-sm font-semibold leading-6">
            {content.toolboxDescription}
          </p>
        ) : null}

        <div className="mt-4 divide-y divide-border/20 border-y border-border/20">
          {content.skillGroups.map((group) => (
            <div key={group.title} className="py-4">
              <p className="text-xs font-black uppercase tracking-[0.14em]">
                {group.title}
              </p>
              {group.description ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {group.description}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {group.skills.join(" / ")}
              </p>
            </div>
          ))}
        </div>
      </MotionBlock>
    </aside>
  );
}
