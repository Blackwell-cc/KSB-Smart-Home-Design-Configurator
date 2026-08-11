import type { LandingContent } from "./landing-content";
import { LandingIcon } from "./landing-icons";
import styles from "./landing-page.module.css";

type Props = Pick<LandingContent, "steps" | "faqs">;

export function SimpleSteps({ steps, faqs }: Props) {
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
      <details className={styles.faq} id="faq">
        <summary>คำถามที่พบบ่อย</summary>
        <dl className={styles.faqAnswers}>
          {faqs.map((faq) => <div className={styles.faqAnswer} key={faq.question}><dt>{faq.question}</dt><dd>{faq.answer}</dd></div>)}
        </dl>
      </details>
    </div>
  );
}
