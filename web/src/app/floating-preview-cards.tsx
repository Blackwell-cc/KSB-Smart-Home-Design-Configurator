import Image from "next/image";
import type { CSSProperties } from "react";
import type { LandingContent } from "./landing-content";
import { LandingIcon } from "./landing-icons";
import styles from "./landing-page.module.css";

type Showcase = LandingContent["showcase"];

export function FloatingPreviewCards({ showcase }: { showcase: Showcase }) {
  return (
    <div aria-label="ตัวอย่างหน้าจอวางแผนบ้าน" className={styles.previewCards} role="group">
      <div className={`${styles.cardFloat} ${styles.stylePosition}`}><article className={styles.previewCard}>
        <p>{showcase.style.label}</p><strong>{showcase.style.selected}</strong>
        <div className={styles.styleChoices}>{showcase.style.choices.map((choice, index) => <span className={styles.styleChoice} data-selected={index === 0} key={choice.label}><Image alt={`ตัวอย่างสไตล์ ${choice.label}`} fill sizes="(max-width: 1023px) 30vw, 92px" src={choice.image} />{index === 0 ? <i aria-hidden="true">✓</i> : null}</span>)}</div>
      </article></div>
      <div className={`${styles.cardFloat} ${styles.areaPosition}`}><article className={styles.previewCard}>
        <p>{showcase.area.label}</p><div className={styles.areaValue}><LandingIcon name="space" /><strong>{showcase.area.value}<small>{showcase.area.unit}</small></strong></div><span aria-hidden="true" className={styles.demoSlider}><i /></span>
      </article></div>
      <div className={`${styles.cardFloat} ${styles.materialPosition}`}><article className={styles.previewCard}>
        <p>{showcase.material.label}</p><strong>{showcase.material.selected}</strong><div aria-hidden="true" className={styles.swatches}>{showcase.material.swatches.map((swatch, index) => <span className={styles.swatch} data-selected={index === 0} key={swatch.label} style={{ "--swatch": swatch.color } as CSSProperties}>{index === 0 ? <i aria-hidden="true">✓</i> : null}</span>)}</div>
      </article></div>
      <div className={`${styles.cardFloat} ${styles.budgetPosition}`}><article className={`${styles.previewCard} ${styles.budgetCard}`}>
        <p>{showcase.budget.label}</p><strong>{showcase.budget.value}</strong><span>{showcase.budget.supporting}</span><span className={styles.detailAffordance}>{showcase.budget.detailLabel} →</span><small>{showcase.budget.disclaimer}</small>
      </article></div>
      <div className={`${styles.cardFloat} ${styles.sharePosition}`}><article className={`${styles.previewCard} ${styles.shareCard}`}>
        <div><strong>{showcase.share.title}</strong><span>{showcase.share.supporting}</span><LandingIcon name="share" /></div><span className={styles.shareThumb}><Image alt={showcase.share.imageAlt} fill sizes="(max-width: 1023px) 52vw, 160px" src="/concepts/contemporary-warm-luxury.png" /></span>
      </article></div>
    </div>
  );
}
