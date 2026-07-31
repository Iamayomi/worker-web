"use client";

import type { PointerEvent, ReactNode } from "react";
import { useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";

type EmojiCursorAreaProps = {
  children: ReactNode;
  className?: string;
  item?: string;
};

export function EmojiCursorArea({
  children,
  className,
  item = "😎",
}: EmojiCursorAreaProps) {
  const [visible, setVisible] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const x = useSpring(cursorX, { stiffness: 300, damping: 30, mass: 0.35 });
  const y = useSpring(cursorY, { stiffness: 300, damping: 30, mass: 0.35 });

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
      className={cn("relative", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setVisible(false)}
    >
      {children}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 hidden text-3xl drop-shadow-sm lg:block"
        animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        style={{ x, y }}
      >
        <span className="inline-block -translate-x-1/2 -translate-y-1/2 rotate-6">
          {item}
        </span>
      </motion.div>
    </section>
  );
}
