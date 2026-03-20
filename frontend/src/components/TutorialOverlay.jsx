import { useEffect, useMemo, useState } from "react";
import "./TutorialOverlay.css";

function TutorialOverlay({ steps, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetBox, setTargetBox] = useState(null);

  const activeStep = steps[currentStep];

  useEffect(() => {
    function updatePosition() {
      if (!activeStep?.targetRef?.current) return;

      const rect = activeStep.targetRef.current.getBoundingClientRect();
      setTargetBox(rect);
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [activeStep]);

  const tooltipStyle = useMemo(() => {
    if (!targetBox) return {};

    const gap = 28;
    const width = 260;

    const tooltipHeight = 180;
    const padding = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;
    let finalPlacement = activeStep?.placement || "right";

    if (finalPlacement === "top") {
    top = targetBox.top - tooltipHeight - gap;
    left = targetBox.left + targetBox.width / 2 - width / 2;

    if (top < padding) {
        finalPlacement = "bottom";
        top = targetBox.bottom + gap;
    }
    }

    if (finalPlacement === "bottom") {
    top = targetBox.bottom + gap;
    left = targetBox.left + targetBox.width / 2 - width / 2;

    if (top + tooltipHeight > viewportHeight - padding) {
        finalPlacement = "top";
        top = targetBox.top - tooltipHeight - gap;
    }
    }

    if (finalPlacement === "left") {
    top = targetBox.top + targetBox.height / 2 - tooltipHeight / 2;
    left = targetBox.left - width - gap;

    if (left < padding) {
        finalPlacement = "right";
        left = targetBox.right + gap;
    }
    }

    if (finalPlacement === "right") {
    top = targetBox.top + targetBox.height / 2 - tooltipHeight / 2;
    left = targetBox.right + gap;

    if (left + width > viewportWidth - padding) {
        finalPlacement = "left";
        left = targetBox.left - width - gap;
    }
    }

    /* keep it inside the screen */
    top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding));
    left = Math.max(padding, Math.min(left, viewportWidth - width - padding));

    return {
    top,
    left,
    width,
    placement: finalPlacement,
    }; }, [targetBox, activeStep]);

  function handleNext() {
    if (currentStep === steps.length - 1) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleSkip(e) {
    e.stopPropagation();
    onClose();
  }

  if (!activeStep || !targetBox) return null;

  return (
    <div className="tutorial-root" onClick={handleNext}>
      <div className="tutorial-overlay" />

      <div
        className="tutorial-highlight"
        style={{
          top: targetBox.top,
          left: targetBox.left,
          width: targetBox.width,
          height: targetBox.height,
        }}
      />

      <div
        className={`tutorial-tooltip ${tooltipStyle.placement || activeStep.placement}`}
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{activeStep.title}</h3>
        <p>{activeStep.text}</p>

        <div className="tutorial-actions">
          <button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </button>
          <button onClick={handleSkip}>Skip</button>
        </div>
      </div>
    </div>
  );
}

export default TutorialOverlay;