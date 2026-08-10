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
          <Image
            alt="โลโก้ KSB Architect"
            className={styles.brandLogo}
            fill
            preload
            sizes="(max-width: 760px) 156px, 196px"
            src="/brand/ksb-architect-logo.png"
          />
        </Link>

        <a
          aria-label={`${content.contactLabel} ${content.contactNumber}`}
          className={styles.headerContact}
          href="tel:0919914592"
        >
          <span>{content.contactLabel}</span>
          <strong>{content.contactNumber}</strong>
          <i aria-hidden="true">↗</i>
        </a>
      </header>

      <main className={styles.main}>
        <section aria-labelledby="landing-heading" className={styles.hero} data-testid="landing-hero">
          <span aria-hidden="true" className={styles.horizon} />

          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              {content.eyebrow}
            </p>
            <h1 id="landing-heading">{content.heading}</h1>
            <p className={styles.statement}>{content.statement}</p>

            <div className={styles.actions}>
              <Link className={styles.primaryCta} href="/configurator">
                {content.primaryCta}
                <span aria-hidden="true">↗</span>
              </Link>
              <a className={styles.secondaryCta} href="tel:0919914592">
                {content.secondaryCta}
                <span aria-hidden="true">โทร 091 991 4592</span>
              </a>
            </div>

            <p className={styles.helper}>
              <span aria-hidden="true">✓</span>
              {content.helper}
            </p>
          </div>

          <div className={styles.visual}>
            <div className={styles.imageFrame}>
              <Image
                alt={content.conceptAlt}
                fill
                preload
                sizes="(max-width: 899px) 100vw, 57vw"
                src="/concepts/contemporary-warm-luxury.png"
              />

              <div className={styles.imageCaption}>
                <p>CONCEPT PREVIEW</p>
                <strong>{content.conceptLabel}</strong>
                <span>แนวทางตั้งต้นสำหรับวางแผนบ้านของคุณ</span>
              </div>

              <div aria-hidden="true" className={styles.imageMark}>
                <span />
                KSB
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
