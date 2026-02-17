"use client";

import { useRef } from "react";
import { motion, useInView, type Variant } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  scale?: boolean;
  blur?: boolean;
  className?: string;
  threshold?: number;
  stagger?: number;
  as?: "div" | "section" | "article" | "span";
}

const directionMap: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: {},
};

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  distance,
  once = true,
  scale = false,
  blur = false,
  className = "",
  threshold = 0.15,
  as = "div",
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin: "-60px 0px",
  });

  const dir = directionMap[direction];
  const customDistance = distance
    ? direction === "up"
      ? { y: distance }
      : direction === "down"
      ? { y: -distance }
      : direction === "left"
      ? { x: distance }
      : direction === "right"
      ? { x: -distance }
      : {}
    : dir;

  const hidden: Variant = {
    opacity: 0,
    ...customDistance,
    ...(scale ? { scale: 0.92 } : {}),
    ...(blur ? { filter: "blur(10px)" } : {}),
  };

  const visible: Variant = {
    opacity: 1,
    x: 0,
    y: 0,
    ...(scale ? { scale: 1 } : {}),
    ...(blur ? { filter: "blur(0px)" } : {}),
  };

  const Component = motion[as];

  return (
    <Component
      ref={ref}
      initial={hidden}
      animate={isInView ? visible : hidden}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

/* Staggered children reveal */
export function StaggerReveal({
  children,
  staggerDelay = 0.08,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  direction?: Direction;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const dir = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, ...dir },
                visible: {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  },
                },
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

/* Section heading with animated decorators */
export function SectionHeading({
  tag,
  title,
  subtitle,
  light = false,
  className = "",
}: {
  tag: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`text-center mb-14 lg:mb-16 ${className}`}
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <motion.span
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`w-12 h-px origin-right ${
            light
              ? "bg-gradient-to-r from-transparent to-gold-400/40"
              : "bg-gradient-to-r from-transparent to-gold-400"
          }`}
        />
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`text-[10px] tracking-[0.3em] uppercase font-bold ${
            light ? "text-gold-400" : "text-gold-600"
          }`}
        >
          {tag}
        </motion.span>
        <motion.span
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`w-12 h-px origin-left ${
            light
              ? "bg-gradient-to-l from-transparent to-gold-400/40"
              : "bg-gradient-to-l from-transparent to-gold-400"
          }`}
        />
      </div>
      <h2
        className={`font-display text-3xl lg:text-[2.75rem] font-bold mb-4 leading-tight ${
          light ? "text-white" : "text-obsidian-950"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`max-w-lg mx-auto text-sm leading-relaxed ${
            light ? "text-obsidian-400" : "text-obsidian-400"
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
