import { Coffee } from "lucide-react";

import { cn } from "@/lib/utils";
import Image from "next/image";

const href = "https://buymeacoffee.com/ayonz";

function CoffeeMark() {
  return (
    <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-foreground/20 bg-[#ffe081] text-foreground shadow-[3px_3px_0_#111827]">
      <span className="absolute -top-3 left-2 h-4 w-1 rounded-full bg-[#ef6f5e] opacity-90" />
      <span className="absolute -top-4 left-4 h-5 w-1 rounded-full bg-[#73c7d5] opacity-90" />
      <span className="absolute -top-3 right-2 h-4 w-1 rounded-full bg-[#b98be0] opacity-90" />
      <Coffee className="h-4 w-4 dark:text-black" />
    </span>
  );
}

export function FooterCoffeeLink() {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="group inline-flex items-center gap-2 py-1 text-xs font-bold uppercase tracking-[0.12em] transition-all hover:text-primary hover:-rotate-1 hover:translate-y-0.5"
    >
      {/* <CoffeeMark /> */}
      <span className="leading-none">Buy me a coffee</span>

      <div className="h-12 w-12">
        <Image
          src={"/bmc.png"}
          width={100}
          height={100}
          alt="Steamy cup of coffee"
          className="object-cover object-center"
        />
      </div>
    </a>
  );
}

export function MobileCoffeeLink({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("mt-3 pt-4 text-right", className)}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        onClick={onClick}
        // className="ml-auto inline-flex max-w-max items-center gap-2 rounded-full border border-foreground/20 bg-[#c9f29b] px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.12em] text-foreground shadow-[3px_3px_0_#111827] transition-transform hover:-rotate-2 dark:text-black"
        className="ml-auto inline-flex max-w-max items-center gap-2 text-[0.65rem] font-black transition-transform hover:-rotate-2 uppercase"
      >
        {/* <CoffeeMark /> */}
        <div className="h-12 w-12">
          <Image
            src={"/bmc.png"}
            width={100}
            height={100}
            alt="Steamy cup of coffee"
            className="object-cover object-center"
          />
        </div>
        <span>Buy Me A Coffee ?</span>
      </a>
    </div>
  );
}
