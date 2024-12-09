"use client";
import React, { useState, useEffect } from "react";
import Joyride, { CallBackProps, Step } from "react-joyride";

interface GuideTourProps {
  steps: Step[];
  guideKey: string; 
}

const GuideTour: React.FC<GuideTourProps> = ({ steps, guideKey }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem(guideKey);
    if (!hasSeenGuide) {
      setRun(true); 
    }
  }, [guideKey]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses = ["finished", "skipped"];

    if (finishedStatuses.includes(status)) {
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
      showProgress
      showSkipButton
      styles={{
        options: {
          arrowColor: "#ffffff",
          backgroundColor: "#1a202c",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          primaryColor: "#0ea5e9",
          textColor: "#ffffff",
          zIndex: 1000,
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default GuideTour;
