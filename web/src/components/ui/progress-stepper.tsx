"use client";

import { useEffect, useRef } from "react";
import styles from "./progress-stepper.module.css";

type ProgressStep = { id: string; label: string };

type ProgressStepperProps = {
  currentStep: number;
  steps: readonly ProgressStep[];
};

export function ProgressStepper({ currentStep, steps }: ProgressStepperProps) {
  const currentStepRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const isCompactStepper = window.matchMedia?.("(max-width: 899px)").matches;
    if (!isCompactStepper || !currentStepRef.current) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    currentStepRef.current.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  }, [currentStep]);

  return (
    <nav aria-label="ขั้นตอนการออกแบบบ้าน" className={styles.navigation}>
      <ol aria-label="ขั้นตอนการออกแบบบ้าน" className={styles.steps}>
        {steps.map((step, index) => {
          const state = index === currentStep ? "current" : index < currentStep ? "complete" : "upcoming";
          return (
            <li aria-current={index === currentStep ? "step" : undefined} data-state={state} key={step.id} ref={index === currentStep ? currentStepRef : undefined}>
              <span aria-hidden="true" className={styles.number}>{index + 1}</span>
              <span>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
