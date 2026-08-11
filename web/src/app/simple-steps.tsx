import type { LandingContent } from "./landing-content";
import { LandingIcon } from "./landing-icons";
import styles from "./landing-page.module.css";

type Props = Pick<LandingContent, "steps">;

export function SimpleSteps({ steps }: Props) {
  return (
    <div className={styles.stepsArea}>
      <div className={styles.stepsCard} id="how-it-works">
        <h2>3 ขั้นตอนง่าย ๆ เพื่อบ้านในฝัน</h2>
        <ol className={styles.stepList}>
          {steps.map((step) => (
            <li key={step.number}>
              <span className={styles.stepNumber}>{step.number}</span>
              <LandingIcon name={step.icon} />
              <div><strong>{step.title}</strong><span>{step.description}</span></div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
