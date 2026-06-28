"use client";

import { useState } from "react";
import { motion } from "motion/react";

export function PwaLaunchScreen() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      animate={{
        opacity: [1, 1, 0],
        scale: [1, 1, 1.02],
      }}
      className="fixed inset-0 z-100 grid place-items-center bg-void px-6"
      initial={{
        opacity: 1,
        scale: 1,
      }}
      onAnimationComplete={() => setIsVisible(false)}
      transition={{
        duration: 0.82,
        ease: "easeInOut",
        times: [0, 0.64, 1],
      }}
    >
      <div className="grid place-items-center text-center">
        <div className="relative grid size-28 place-items-center border-4 border-outline bg-amber shadow-pixel-lg">
          <div className="absolute -top-7 h-8 w-14 border-4 border-outline border-b-0" />

          <div className="grid size-15 place-items-center border-4 border-outline bg-amber-light">
            <span className="font-pixel text-2xl text-void">L</span>
          </div>
        </div>

        <p className="mt-8 font-pixel text-base tracking-[0.16em] text-cream">
          LANTERN
        </p>

        <p className="mt-3 font-pixel text-[9px] leading-5 text-amber-light">
          ROZSVĚCÍM TAVERNÍ TABULI…
        </p>
      </div>
    </motion.div>
  );
}