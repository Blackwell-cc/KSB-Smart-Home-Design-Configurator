import { getLandingContent } from "./landing-content";
import { LandingHeader } from "./landing-header";
import { HeroSection } from "./hero-section";
import styles from "./landing-page.module.css";

export default function HomePage() {
  const content = getLandingContent();

  return <div className={styles.page}><div aria-hidden="true" className={styles.heroBackdrop} /><LandingHeader content={content} /><main><HeroSection content={content} /></main></div>;
}
