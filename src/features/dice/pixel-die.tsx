"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import type { DieSides } from "@/types/dice";

type PixelDieProps = {
  value: number;
  sides: DieSides;
  isRolling?: boolean;
  isKept?: boolean;
  className?: string;
};

export function PixelDie({
  value,
  sides,
  isRolling = false,
  isKept = false,
  className,
}: PixelDieProps) {
  return (
    <motion.div
      animate={{
        rotate: isRolling ? [0, 12, -15, 9, -6, 0] : 0,
        scale: isRolling ? [1, 1.08, 0.94, 1] : 1,
        y: isRolling ? [0, -12, 4, -5, 0] : 0,
      }}
      className={cn(
        [
          "relative grid size-18 place-items-center border-4 border-outline",
          "bg-cream font-pixel text-lg text-void shadow-pixel",
          "sm:size-22 sm:text-xl",
        ],
        isKept
          ? "ring-4 ring-amber-light ring-offset-4 ring-offset-panel-deep"
          : "",
        className,
      )}
      transition={{
        duration: 0.62,
        ease: "easeInOut",
      }}
    >
      <span className="absolute left-1.5 top-1 font-pixel text-[7px] text-amber-dark">
        d{sides}
      </span>

      <span>{value}</span>

      {isKept ? (
        <span className="absolute -bottom-3 border-2 border-outline bg-amber px-1.5 py-0.5 font-pixel text-[7px] text-void">
          KEEP
        </span>
      ) : null}
    </motion.div>
  );
}