"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animation/variants";

interface AnimatedContentProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedContent({ children, className }: AnimatedContentProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}
