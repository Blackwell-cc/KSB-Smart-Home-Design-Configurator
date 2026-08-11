import Image from "next/image";
import type { LandingContent } from "./landing-content";
import { FloatingPreviewCards } from "./floating-preview-cards";
import styles from "./landing-page.module.css";

export function HouseShowcase({ showcase }: { showcase: LandingContent["showcase"] }) {
  return (
    <div className={styles.houseArea} id="house-preview">
      <div className={styles.houseImage}>
        <Image alt={showcase.imageAlt} fill preload sizes="(max-width: 899px) 100vw, 60vw" src="/concepts/contemporary-warm-luxury.png" />
      </div>
      <FloatingPreviewCards showcase={showcase} />
    </div>
  );
}
