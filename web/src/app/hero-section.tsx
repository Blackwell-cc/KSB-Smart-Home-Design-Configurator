import Link from "next/link";
import type { LandingContent } from "./landing-content";
import { HouseShowcase } from "./house-showcase";
import { LandingIcon } from "./landing-icons";
import { SimpleSteps } from "./simple-steps";
import styles from "./landing-page.module.css";

export function HeroSection({ content }: { content: LandingContent }) {
  return (
    <section aria-labelledby="landing-heading" className={styles.hero} id="start">
      <div className={styles.heroContent}>
        <h1 className={styles.headlineReveal} id="landing-heading"><span>{content.hero.headingLead}</span><strong>{content.hero.headingAccent}</strong></h1>
        <p className={`${styles.supportingCopy} ${styles.supportReveal}`}>{content.hero.supportingCopy}</p>
        <p className={`${styles.explanation} ${styles.explanationReveal}`}>{content.hero.explanation}</p>
        <div className={`${styles.heroActions} ${styles.actionReveal}`}>
          <Link className={styles.primaryCta} href="/configurator"><LandingIcon name="calculator" />{content.hero.primaryCta}<LandingIcon name="arrow" /></Link>
          <a className={styles.secondaryCta} href="#house-preview"><LandingIcon name="eye" />{content.hero.secondaryCta}</a>
        </div>
      </div>
      <HouseShowcase showcase={content.showcase} />
      <div aria-label="ประโยชน์ของเครื่องมือ" className={`${styles.benefitRow} ${styles.benefitReveal}`}>
        {content.benefits.map((benefit) => <div key={benefit.label}><LandingIcon name={benefit.icon} /><span>{benefit.label}</span></div>)}
      </div>
      <SimpleSteps steps={content.steps} />
    </section>
  );
}
