"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type MotionProps = {
  children: ReactNode;
  className?: string;
};

export function MotionBlock({ children, className }: MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionList({ children, className }: MotionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.18 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.06,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function MotionItem({ children, className }: MotionProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 26, rotateX: -10, rotate: -0.4 },
        show: { opacity: 1, y: 0, rotateX: 0, rotate: 0 },
      }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      className={cn("origin-top will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
