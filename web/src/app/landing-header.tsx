import Image from "next/image";
import Link from "next/link";
import type { LandingContent } from "./landing-content";
import { LandingIcon } from "./landing-icons";
import styles from "./landing-page.module.css";

export function LandingHeader({ content }: { content: LandingContent }) {
  const links = content.navigation.map((item, index) => (
    <a aria-current={index === 0 ? "page" : undefined} href={item.href} key={item.href}>{item.label}</a>
  ));

  return (
    <header className={styles.header}>
      <Link aria-label={content.brand.homeLabel} className={styles.brand} href="/">
        <Image alt={content.brand.logoAlt} className={styles.brandLogo} fill preload sizes="(max-width: 1023px) 122px, 148px" src="/brand/ksb-architect-logo.png" />
      </Link>
      <nav aria-label="เมนูหลัก" className={styles.desktopNav}>{links}</nav>
      <div className={styles.headerActions}>
        <a aria-label={`${content.header.phoneLabel} ${content.header.phoneNumber}`} className={styles.phoneLink} href="tel:0919914592"><LandingIcon name="phone" /><span>{content.header.phoneNumber}</span></a>
        <Link className={styles.headerCta} href="/configurator">{content.header.ctaLabel}</Link>
        <details className={styles.mobileMenu}>
          <summary aria-label="เมนูหลัก"><LandingIcon name="menu" /></summary>
          <nav aria-label="เมนูหลักบนมือถือ">{links}<a href="tel:0919914592">{content.header.phoneNumber}</a></nav>
        </details>
      </div>
    </header>
  );
}
