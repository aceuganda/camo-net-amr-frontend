"use client";
import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Small inline "terminology correction" gag. At rest, "Data Warehouse" sits
// in a subtle accent colour with a dotted underline as a hint that it's
// interactive. Hovering strikes it through and reveals "Data Lake House"
// next to it; moving away resets it so the gag can be replayed. Space for
// the replacement is reserved from the first render so it never causes a
// layout jump when it fades in.
const DataWarehouseCorrection: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const revealed = isHovered;
  const strikeTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.35, delay: revealed ? 0.1 : 0, ease: "easeInOut" as const };
  const replacementTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, delay: revealed ? 0.45 : 0, ease: "easeOut" as const };

  return (
    <span
      className="cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative inline-block">
        <motion.span
          className="underline decoration-dotted decoration-[#00B9F1] underline-offset-2"
          initial={false}
          animate={{ color: revealed ? "#9CA3AF" : "#0B84B0" }}
          transition={strikeTransition}
        >
          Data Warehouse
        </motion.span>
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 origin-left bg-gray-400"
          initial={false}
          animate={{ scaleX: revealed ? 1 : 0 }}
          transition={strikeTransition}
        />
      </span>{" "}
      <motion.span
        className="inline-block font-semibold text-[#24408E]"
        initial={false}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 6 }}
        transition={replacementTransition}
      >
        Data Lake House
      </motion.span>
    </span>
  );
};

export default DataWarehouseCorrection;
