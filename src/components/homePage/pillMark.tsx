"use client";
import React, { useEffect, useId } from "react";
import { motion, animate, useMotionValue, useReducedMotion } from "framer-motion";

// Small hand-authored capsule/pill mark for the hero copy - a nod to
// antibiotics that suits an AMR data portal. Idles with a slow, continuous
// spin; a hover "flicks" it with a quick burst of rotation that decays back
// into the calm idle spin via a spring's own velocity decay (no abrupt
// speed switch).
const PillMark: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const impulse = useMotionValue(0);
  // useId() contains colons, which some browsers choke on inside url(#...) refs
  const reactId = useId().replace(/:/g, "");
  const leftClipId = `pill-left-${reactId}`;
  const rightClipId = `pill-right-${reactId}`;

  useEffect(() => {
    return () => {
      impulse.stop();
    };
  }, [impulse]);

  const handleHoverStart = () => {
    if (prefersReducedMotion) return;
    animate(impulse, 0, {
      type: "spring",
      velocity: 900,
      stiffness: 40,
      damping: 5,
      restDelta: 0.5,
    });
  };

  return (
    <motion.span
      aria-hidden="true"
      className="ml-0 inline-block cursor-pointer align-baseline text-white"
      style={{ width: "0.55em", height: "0.55em" }}
      animate={prefersReducedMotion ? undefined : { rotate: 360 }}
      transition={
        prefersReducedMotion
          ? undefined
          : { repeat: Infinity, ease: "linear", duration: 30 }
      }
      onHoverStart={handleHoverStart}
    >
      <motion.span
        className="block h-full w-full"
        style={{ rotate: impulse }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-full w-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
          focusable="false"
        >
          <defs>
            <clipPath id={leftClipId}>
              <rect x="-9" y="-4.5" width="9" height="9" />
            </clipPath>
            <clipPath id={rightClipId}>
              <rect x="0" y="-4.5" width="9" height="9" />
            </clipPath>
          </defs>
          <g transform="translate(12 12) rotate(45)">
            <rect
              x="-9"
              y="-4.5"
              width="18"
              height="9"
              rx="4.5"
              fill="#00B9F1"
              clipPath={`url(#${leftClipId})`}
            />
            <rect
              x="-9"
              y="-4.5"
              width="18"
              height="9"
              rx="4.5"
              fill="#24408E"
              clipPath={`url(#${rightClipId})`}
            />
            <rect
              x="-9"
              y="-4.5"
              width="18"
              height="9"
              rx="4.5"
              stroke="currentColor"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="-4.5"
              x2="0"
              y2="4.5"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </g>
        </svg>
      </motion.span>
    </motion.span>
  );
};

export default PillMark;
