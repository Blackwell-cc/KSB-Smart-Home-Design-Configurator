import Image from "next/image";
import type { LandingContent } from "./landing-content";
import { FloatingPreviewCards } from "./floating-preview-cards";
import styles from "./landing-page.module.css";

export function HouseShowcase({ showcase }: { showcase: LandingContent["showcase"] }) {
  return (
    <div className={styles.houseArea} id="house-preview">
      <div className={`${styles.houseImage} ${styles.houseImageReveal}`}>
        <Image alt={showcase.imageAlt} fill preload sizes="(max-width: 1023px) 100vw, 60vw" src="/backgrounds/bg-01.png" />
      </div>
      <FloatingPreviewCards showcase={showcase} />
    </div>
  );
}
