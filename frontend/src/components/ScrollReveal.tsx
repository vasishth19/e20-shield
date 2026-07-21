"use client";

/**
 * Scroll-triggered fade/slide-in wrapper using Framer Motion.
 * Used throughout the storytelling homepage sections.
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
  className?: string;
}) {
  const offset =
    direction === "up" ? { y: 40 } : direction === "left" ? { x: -40 } : { x: 40 };

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
