"use client";
import React, { useState, useEffect } from "react";
import {
  EventData,
  Joyride,
  STATUS,
  Step,
  TooltipRenderProps,
} from "react-joyride";
import { X } from "lucide-react";

interface GuideTourProps {
  steps: Step[];
  guideKey: string;
  /** Render nothing until the page is ready — useful when targets mount late. */
  delay?: number;
}

const Tooltip = ({
  backProps,
  closeProps,
  continuous,
  index,
  primaryProps,
  skipProps,
  step,
  tooltipProps,
  size,
  isLastStep,
}: TooltipRenderProps) => (
  <div
    {...tooltipProps}
    className="w-[19rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(36,64,142,0.45)] ring-1 ring-black/5 sm:w-[22rem]"
  >
    <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-[#24408E] via-[#1e3a82] to-[#00B9F1] px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
          Step {index + 1} of {size}
        </p>
        {step.title && (
          <h4 className="mt-0.5 truncate text-base font-semibold text-white">
            {step.title}
          </h4>
        )}
      </div>
      <button
        {...closeProps}
        aria-label="Close tour"
        className="-mr-1 -mt-0.5 shrink-0 rounded-lg p-1.5 text-white/70 transition-colors duration-200 hover:bg-white/15 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>

    <div className="px-5 py-4">
      <div className="text-[13px] leading-relaxed text-gray-600">
        {step.content}
      </div>

      {/* Progress dots */}
      <div className="mt-4 flex items-center gap-1.5">
        {Array.from({ length: size }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index
                ? "w-5 bg-[#00B9F1]"
                : i < index
                ? "w-1.5 bg-[#24408E]/40"
                : "w-1.5 bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>

    <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
      <button
        {...skipProps}
        className="text-xs font-medium text-gray-400 transition-colors duration-200 hover:text-gray-600"
      >
        Skip tour
      </button>

      <div className="flex items-center gap-2">
        {index > 0 && (
          <button
            {...backProps}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-[#24408E] transition-colors duration-200 hover:bg-[#24408E]/5"
          >
            Back
          </button>
        )}
        {continuous && (
          <button
            {...primaryProps}
            className="rounded-lg bg-gradient-to-r from-[#24408E] to-[#00B9F1] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow-md"
          >
            {isLastStep ? "Got it" : "Next"}
          </button>
        )}
      </div>
    </div>
  </div>
);

const GuideTour: React.FC<GuideTourProps> = ({ steps, guideKey, delay = 600 }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem(guideKey);
    if (hasSeenGuide) return;

    // Give the page a moment to paint so step 1's target is measurable.
    const timer = setTimeout(() => setRun(true), delay);
    return () => clearTimeout(timer);
  }, [guideKey, delay]);

  const handleJoyrideEvent = ({ status }: EventData) => {
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Mark the guide as completed
      localStorage.setItem(guideKey, "true");
      setRun(false); // Stop the guide
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      tooltipComponent={Tooltip}
      options={{
        arrowColor: "#24408E",
        arrowSize: 8,
        arrowBase: 14,
        overlayClickAction: false,
        overlayColor: "rgba(10, 20, 45, 0.65)",
        primaryColor: "#00B9F1",
        scrollOffset: 120,
        spotlightPadding: 6,
        spotlightRadius: 12,
        zIndex: 100000,
      }}
      onEvent={handleJoyrideEvent}
    />
  );
};

export default GuideTour;
