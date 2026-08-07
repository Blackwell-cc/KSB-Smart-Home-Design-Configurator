import styles from "./progress-stepper.module.css";

type ProgressStep = { id: string; label: string };

type ProgressStepperProps = {
  currentStep: number;
  steps: readonly ProgressStep[];
};

export function ProgressStepper({ currentStep, steps }: ProgressStepperProps) {
  return (
    <nav aria-label="ขั้นตอนการออกแบบบ้าน" className={styles.navigation}>
      <ol aria-label="ขั้นตอนการออกแบบบ้าน" className={styles.steps}>
        {steps.map((step, index) => {
          const state = index === currentStep ? "current" : index < currentStep ? "complete" : "upcoming";
          return (
            <li aria-current={index === currentStep ? "step" : undefined} data-state={state} key={step.id}>
              <span aria-hidden="true" className={styles.number}>{index + 1}</span>
              <span>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
