import type { CSSProperties } from "react";
import styles from "./ai-loader.module.css";

type AiLoaderProps = {
  size?: number;
  text?: string;
};

export function AiLoader({ size = 188, text = "KSB" }: AiLoaderProps) {
  const letters = Array.from(text);

  return (
    <div aria-busy="true" aria-label="กำลังประเมินงบประมาณ" aria-live="polite" className={styles.overlay} role="status">
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.loader} style={{ "--loader-size": `${size}px` } as CSSProperties}>
          <div className={styles.orbit} data-testid="ai-loader-ring" aria-hidden="true" />
          <div className={styles.innerRing} aria-hidden="true" />
          <span className={styles.letters} aria-hidden="true">
            {letters.map((letter, index) => (
              <span key={`${letter}-${index}`} style={{ animationDelay: `${index * 110}ms` }}>{letter}</span>
            ))}
          </span>
        </div>
        <div className={styles.copy}>
          <strong>กำลังประเมินงบประมาณ</strong>
          <span>กำลังจัดเตรียมภาพรวมบ้านและกรอบค่าใช้จ่ายของคุณ</span>
          <i aria-hidden="true"><b /></i>
        </div>
      </div>
    </div>
  );
}
