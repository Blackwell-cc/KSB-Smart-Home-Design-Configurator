import Image from "next/image";
import Link from "next/link";
import { getLandingContent } from "./landing-content";
import styles from "./landing-page.module.css";

export default function HomePage() {
  const content = getLandingContent();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link aria-label="KSB Architect หน้าแรก" className={styles.brand} href="/">
          <strong>{content.brand}</strong>
          <span>{content.productLabel}</span>
        </Link>
        <a
          aria-label={`${content.contactLabel} ${content.contactNumber}`}
          className={styles.headerContact}
          href="tel:0919914592"
        >
          <span>{content.contactLabel}</span>
          <strong>{content.contactNumber}</strong>
        </a>
      </header>

      <main>
        <section aria-labelledby="landing-heading" className={styles.hero} data-testid="landing-hero">
          <div className={styles.heroCopy}>
            <div className={styles.heroMeta}>
              <p>{content.eyebrow}</p>
              <span>01 / PROJECT BRIEF</span>
            </div>
            <h1 id="landing-heading">{content.heading}</h1>
            <p className={styles.statement}>{content.statement}</p>
            <p className={styles.description}>{content.description}</p>
            <div className={styles.actions}>
              <Link className={styles.primaryCta} href="/configurator">
                {content.primaryCta}
                <span aria-hidden="true">↗</span>
              </Link>
              <a className={styles.secondaryCta} href="#process">
                {content.secondaryCta}
                <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className={styles.helper}>{content.helper}</p>
          </div>

          <div className={styles.visual}>
            <div className={styles.imageFrame}>
              <Image
                alt={content.conceptAlt}
                fill
                preload
                sizes="(max-width: 899px) 100vw, 55vw"
                src="/concepts/contemporary-warm-luxury.png"
              />
              <span aria-hidden="true" className={styles.crosshairHorizontal} />
              <span aria-hidden="true" className={styles.crosshairVertical} />
              <div className={styles.imageIndex}>
                <span>01</span>
                <small>CURATED CONCEPT</small>
              </div>
              <div className={styles.briefingPlate}>
                <div>
                  <span>PROJECT BRIEF / 01</span>
                  <strong>{content.conceptLabel}</strong>
                </div>
                <div>
                  <span>STUDY</span>
                  <strong>CONCEPT</strong>
                </div>
                <div>
                  <span>STATUS</span>
                  <strong>PRELIMINARY</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="สิ่งที่คุณจะได้รับ" className={styles.valueRail}>
          {content.values.map((item) => (
            <article className={styles.valueItem} key={item.number}>
              <span>{item.number}</span>
              <div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section aria-labelledby="process-heading" className={styles.process} id="process">
          <div className={styles.processIntro}>
            <p className={styles.sectionEyebrow}>{content.processEyebrow}</p>
            <h2 id="process-heading">{content.processHeading}</h2>
            <p>{content.processDescription}</p>
          </div>
          <div className={styles.processSteps}>
            {content.processSteps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
          <aside className={styles.scopeNote}>
            <p>{content.scopeLabel}</p>
            <strong>{content.scopeNote}</strong>
          </aside>
        </section>

        <section aria-labelledby="final-heading" className={styles.finalCtaSection}>
          <div>
            <p className={styles.sectionEyebrow}>{content.finalEyebrow}</p>
            <h2 id="final-heading">{content.finalHeading}</h2>
          </div>
          <div>
            <p>{content.finalDescription}</p>
            <div className={styles.actions}>
              <Link className={styles.primaryCta} href="/configurator">
                {content.finalCta}
                <span aria-hidden="true">↗</span>
              </Link>
              <a className={styles.secondaryCta} href="tel:0919914592">
                {content.contactCta}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <strong>{content.brand}</strong>
        <p>{content.footerNote}</p>
        <span>© 2026 KSB Architect</span>
      </footer>
    </div>
  );
}
