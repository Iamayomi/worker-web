"use client";

import type { PointerEvent, ReactNode } from "react";
import { useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";
import Image from "next/image";

type HeroPortraitCursorProps = {
  children: ReactNode;
  className?: string;
  imageUrl?: string;
};

export function HeroPortraitCursor({
  children,
  className,
  imageUrl = "/dp.png",
}: HeroPortraitCursorProps) {
  const [visible, setVisible] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const x = useSpring(cursorX, { stiffness: 260, damping: 28, mass: 0.45 });
  const y = useSpring(cursorY, { stiffness: 260, damping: 28, mass: 0.45 });

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const target = event.target;
    const isInteractive =
      target instanceof Element && Boolean(target.closest("a, button"));

    if (isInteractive || event.pointerType === "touch") {
      setVisible(false);
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();

    cursorX.set(event.clientX - bounds.left);
    cursorY.set(event.clientY - bounds.top);
    setVisible(true);
  };

  return (
    <section
      className={cn("relative overflow-hidden", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setVisible(false)}
    >
      {children}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 hidden h-36 w-36 lg:block"
        initial={{ opacity: 0 }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.88,
          rotate: visible ? -3 : 2,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{
          x,
          y,
        }}
      >
        <div
          className="h-full w-full -translate-x-1/2 -translate-y-1/2 overflow-hidden border-3 border-border/30 bg-card shadow-sm"
          style={{
            borderRadius: "47% 53% 42% 58% / 55% 44% 56% 45%",
          }}
        >
          <Image
            src={imageUrl}
            alt="Floating theme photo of myself"
            className="h-full w-full scale-110 object-cover object-center"
            style={{ objectPosition: "50% 28%" }}
            loading="eager"
            width={400}
            height={400}
            draggable={false}
            priority
          />
        </div>
      </motion.div>
    </section>
  );
}
