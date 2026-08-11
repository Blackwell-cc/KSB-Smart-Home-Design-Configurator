# Consumer Configurator Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างหน้า `/` แบบ Consumer Hero ที่ใกล้ภาพ `Ref-hero1.png` โดยใช้ภาพบ้านและโลโก้ในโปรเจกต์ พร้อมการ์ด Demo ลอยช้า ๆ ที่ไม่รับ input และ CTA เข้า Configurator

**Architecture:** หน้า `page.tsx` ยังคงเป็น Server Component และประกอบ component ย่อยที่ไม่มี state/event handler ได้แก่ Header, Hero, House Showcase, Floating Cards และ Simple Steps ข้อมูล copy/static sample อยู่ใน `landing-content.ts` เพียงแหล่งเดียว ส่วน layout, responsive behavior และ motion อยู่ใน CSS Module เดิมโดยไม่เพิ่ม dependency หรือแตะ pricing/configurator domain

**Tech Stack:** Next.js 16.3 App Router, React 19 Server Components, TypeScript 5, CSS Modules, `next/image`, Prompt via `next/font`, Vitest, Testing Library, Playwright

## Global Constraints

- แก้เฉพาะหน้า `/`, tests และ QA artifacts ที่เกี่ยวข้อง
- ไม่แก้ Configurator, calculation domain, pricing API, Price Book หรือ Preview workflow
- ใช้ `/brand/ksb-architect-logo.png` และ `/concepts/contemporary-warm-luxury.png`; ห้ามเพิ่ม external asset URL
- ใช้ Prompt และ visual tokens Obsidian/Champagne Gold/Warm Ivory เดิม
- หน้า Landing ไม่มี API call, client state หรือ dependency เพิ่ม
- ไม่มี client state; mobile menu และ FAQ ใช้ native `<details>`/`<summary>`
- Floating cards เป็น static semantic content ไม่มี `<button>`, `<input>`, event handler หรือ `tabIndex`
- Budget card ต้องแสดง `ตัวอย่างหน้าจอ · ไม่ใช่ราคาประเมิน` เสมอ
- Card float ระยะไม่เกิน 6px, duration 7–11s และปิดทั้งหมดเมื่อ `prefers-reduced-motion: reduce`
- CTA/link touch target อย่างน้อย 44px; primary actions อย่างน้อย 48px
- ไม่มี horizontal overflow ที่ 375px
- Target WCAG 2.2 AA

---

### Task 1: Replace the landing content contract

**Files:**
- Modify: `web/src/app/landing-content.test.ts`
- Modify: `web/src/app/landing-content.ts`

**Interfaces:**
- Produces: `LandingContent`, `LandingIconName`, `getLandingContent(locale?: LandingLocale): LandingContent`
- Consumers: `LandingHeader`, `HeroSection`, `HouseShowcase`, `FloatingPreviewCards`, `SimpleSteps`

- [ ] **Step 1: Write the failing content test**

Replace `web/src/app/landing-content.test.ts` with:

```ts
import { getLandingContent } from "./landing-content";

test("provides the approved consumer hero content and safe demo budget", () => {
  const content = getLandingContent("th");

  expect(content.hero).toMatchObject({
    headingLead: "บ้านในฝันของคุณ",
    headingAccent: "ราคาเท่าไหร่?",
    primaryCta: "เริ่มประเมินฟรี",
    secondaryCta: "ดูตัวอย่างบ้าน",
  });
  expect(content.navigation.map((item) => item.label)).toEqual([
    "เริ่มต้น",
    "แบบบ้าน",
    "วิธีใช้งาน",
    "คำถามที่พบบ่อย",
  ]);
  expect(content.benefits).toHaveLength(3);
  expect(content.steps).toHaveLength(3);
  expect(content.showcase.budget.disclaimer).toBe("ตัวอย่างหน้าจอ · ไม่ใช่ราคาประเมิน");
  expect(content.showcase.budget.value).toBe("5.8 – 6.9 ล้านบาท");
  expect(content.faqs).toHaveLength(3);
});

test("falls back to Thai for an untranslated locale", () => {
  expect(getLandingContent("en")).toEqual(getLandingContent("th"));
});
```

- [ ] **Step 2: Run the content test and verify RED**

Run: `npm test -- src/app/landing-content.test.ts`

Expected: FAIL because the current flat `LandingContent` has no `hero`, `navigation`, `benefits`, `steps`, `showcase`, or `faqs` fields.

- [ ] **Step 3: Implement the typed content model**

Replace `web/src/app/landing-content.ts` with this model and the exact approved values:

```ts
export type LandingLocale = "th" | "en";
export type LandingIconName = "phone" | "calculator" | "eye" | "clock" | "shield" | "share" | "home" | "space" | "chart" | "menu" | "arrow";

type NavigationItem = { label: string; href: `#${string}` };
type BenefitItem = { label: string; icon: LandingIconName };
type StepItem = { number: string; title: string; description: string; icon: LandingIconName };
type FaqItem = { question: string; answer: string };

export type LandingContent = {
  brand: { logoAlt: string; homeLabel: string };
  header: { phoneLabel: string; phoneNumber: string; ctaLabel: string };
  navigation: NavigationItem[];
  hero: {
    headingLead: string;
    headingAccent: string;
    supportingCopy: string;
    explanation: string;
    primaryCta: string;
    secondaryCta: string;
  };
  benefits: BenefitItem[];
  steps: StepItem[];
  faqs: FaqItem[];
  showcase: {
    imageAlt: string;
    style: { label: string; selected: string; choices: Array<{ label: string; image: string }> };
    area: { label: string; value: string; unit: string };
    material: { label: string; selected: string; swatches: Array<{ label: string; color: string }> };
    budget: { label: string; value: string; supporting: string; detailLabel: string; disclaimer: string };
    share: { title: string; supporting: string; imageAlt: string };
  };
};

const thaiContent: LandingContent = {
  brand: { logoAlt: "โลโก้ KSB Architect", homeLabel: "KSB Architect หน้าแรก" },
  header: { phoneLabel: "โทรปรึกษา", phoneNumber: "091 991 4592", ctaLabel: "ลองประเมินฟรี" },
  navigation: [
    { label: "เริ่มต้น", href: "#start" },
    { label: "แบบบ้าน", href: "#house-preview" },
    { label: "วิธีใช้งาน", href: "#how-it-works" },
    { label: "คำถามที่พบบ่อย", href: "#faq" },
  ],
  hero: {
    headingLead: "บ้านในฝันของคุณ",
    headingAccent: "ราคาเท่าไหร่?",
    supportingCopy: "ลองเลือกสไตล์ ฟังก์ชัน และการตกแต่ง เพื่อดูงบประมาณและภาพบ้านเบื้องต้นของคุณ",
    explanation: "เครื่องมือช่วยวางแผนบ้านที่เข้าใจง่าย ให้คุณเห็นภาพบ้านในฝัน พร้อมงบประมาณเบื้องต้น ก่อนตัดสินใจคุยรายละเอียดกับสถาปนิก",
    primaryCta: "เริ่มประเมินฟรี",
    secondaryCta: "ดูตัวอย่างบ้าน",
  },
  benefits: [
    { label: "ใช้เวลา 3–5 นาที", icon: "clock" },
    { label: "ไม่ต้องกรอกข้อมูลก่อน", icon: "shield" },
    { label: "แชร์ผลลัพธ์ให้ครอบครัวได้", icon: "share" },
  ],
  steps: [
    { number: "1", title: "เลือกสไตล์", description: "สไตล์ที่ใช่สำหรับคุณ", icon: "home" },
    { number: "2", title: "ปรับฟังก์ชัน", description: "ขนาดพื้นที่และฟังก์ชัน", icon: "space" },
    { number: "3", title: "ดูราคาและภาพตัวอย่าง", description: "เห็นงบประมาณและภาพบ้าน", icon: "chart" },
  ],
  faqs: [
    { question: "ตัวเลขที่เห็นเป็นราคาสุดท้ายหรือไม่?", answer: "ไม่ใช่ ผลลัพธ์เป็นการประเมินเบื้องต้นเพื่อช่วยวางแผนก่อนคุยรายละเอียดกับสถาปนิก" },
    { question: "ต้องให้ข้อมูลส่วนตัวก่อนหรือไม่?", answer: "ไม่ต้อง คุณสามารถเลือกความต้องการและดู Preview แรกได้ก่อนกรอกข้อมูลติดต่อ" },
    { question: "กลับมาแก้ไขหรือแชร์ผลลัพธ์ได้ไหม?", answer: "ได้ คุณสามารถย้อนกลับไปปรับตัวเลือกและแชร์ผลลัพธ์ให้ครอบครัวช่วยตัดสินใจได้" },
  ],
  showcase: {
    imageAlt: "บ้านร่วมสมัยแสงอบอุ่นช่วงเย็นสำหรับตัวอย่างการวางแผนบ้าน",
    style: {
      label: "สไตล์บ้าน",
      selected: "Modern Warm",
      choices: [
        { label: "Modern Warm", image: "/concepts/contemporary-warm-luxury.png" },
        { label: "Tropical", image: "/concepts/modern-tropical-resort.png" },
        { label: "Timeless", image: "/concepts/timeless-contemporary-luxury.png" },
      ],
    },
    area: { label: "พื้นที่ใช้สอย", value: "320", unit: "ตร.ม." },
    material: {
      label: "ระดับวัสดุและการตกแต่ง",
      selected: "Premium",
      swatches: [
        { label: "ไม้", color: "#75583E" },
        { label: "หิน", color: "#B6A58D" },
        { label: "กระจก", color: "#849097" },
        { label: "ผิวสีอ่อน", color: "#D8D0C4" },
      ],
    },
    budget: {
      label: "งบประมาณเริ่มต้น",
      value: "5.8 – 6.9 ล้านบาท",
      supporting: "ช่วงราคาประมาณการเบื้องต้น",
      detailLabel: "ดูรายละเอียด",
      disclaimer: "ตัวอย่างหน้าจอ · ไม่ใช่ราคาประเมิน",
    },
    share: { title: "Preview พร้อมแชร์", supporting: "ส่งให้ครอบครัวช่วยตัดสินใจ", imageAlt: "ภาพย่อ Preview บ้านสำหรับแชร์" },
  },
};

const landingContent: Partial<Record<LandingLocale, LandingContent>> = { th: thaiContent };

export function getLandingContent(locale: LandingLocale = "th"): LandingContent {
  return landingContent[locale] ?? thaiContent;
}
```

- [ ] **Step 4: Run the content test and verify GREEN**

Run: `npm test -- src/app/landing-content.test.ts`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit the content contract**

```powershell
git add web/src/app/landing-content.ts web/src/app/landing-content.test.ts
git commit -m "feat: define consumer hero content"
```

---

### Task 2: Build semantic server components for the Hero

**Files:**
- Modify: `web/src/app/home-page.test.tsx`
- Modify: `web/src/app/page.tsx`
- Create: `web/src/app/landing-icons.tsx`
- Create: `web/src/app/landing-header.tsx`
- Create: `web/src/app/floating-preview-cards.tsx`
- Create: `web/src/app/house-showcase.tsx`
- Create: `web/src/app/simple-steps.tsx`
- Create: `web/src/app/hero-section.tsx`

**Interfaces:**
- Consumes: `LandingContent`, `LandingIconName`
- Produces: `LandingHeader({ content })`, `HeroSection({ content })`, `HouseShowcase({ showcase })`, `FloatingPreviewCards({ showcase })`, `SimpleSteps({ steps, faqs })`, `LandingIcon({ name })`

- [ ] **Step 1: Write failing semantic and interaction-boundary tests**

Replace `web/src/app/home-page.test.tsx` with:

```tsx
import { render, screen, within } from "@testing-library/react";
import HomePage from "./page";

test("renders the consumer acquisition header and one focused hero", () => {
  const { container } = render(<HomePage />);

  expect(container.querySelectorAll("main section")).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "บ้านในฝันของคุณ ราคาเท่าไหร่?" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "โลโก้ KSB Architect" })).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: "เริ่มต้น" })[0]).toHaveAttribute("href", "#start");
  expect(screen.getAllByRole("link", { name: "แบบบ้าน" })[0]).toHaveAttribute("href", "#house-preview");
  expect(screen.getAllByRole("link", { name: "วิธีใช้งาน" })[0]).toHaveAttribute("href", "#how-it-works");
  expect(screen.getAllByRole("link", { name: "คำถามที่พบบ่อย" })[0]).toHaveAttribute("href", "#faq");
  expect(screen.getByRole("link", { name: "ลองประเมินฟรี" })).toHaveAttribute("href", "/configurator");
  expect(screen.getByRole("link", { name: "เริ่มประเมินฟรี" })).toHaveAttribute("href", "/configurator");
  expect(screen.getByRole("link", { name: "ดูตัวอย่างบ้าน" })).toHaveAttribute("href", "#house-preview");
});

test("renders five non-interactive demo cards with safe sample pricing", () => {
  render(<HomePage />);

  const showcase = screen.getByRole("group", { name: "ตัวอย่างหน้าจอวางแผนบ้าน" });
  expect(within(showcase).getAllByRole("article")).toHaveLength(5);
  expect(within(showcase).queryByRole("button")).not.toBeInTheDocument();
  expect(within(showcase).queryByRole("slider")).not.toBeInTheDocument();
  expect(within(showcase).getByText("5.8 – 6.9 ล้านบาท")).toBeInTheDocument();
  expect(within(showcase).getByText("ตัวอย่างหน้าจอ · ไม่ใช่ราคาประเมิน")).toBeInTheDocument();
  expect(screen.getAllByText(/ใช้เวลา 3–5 นาที/)).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "3 ขั้นตอนง่าย ๆ เพื่อบ้านในฝัน" })).toBeInTheDocument();
  expect(screen.getByText("ตัวเลขที่เห็นเป็นราคาสุดท้ายหรือไม่?")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the homepage test and verify RED**

Run: `npm test -- src/app/home-page.test.tsx`

Expected: FAIL because the approved heading, navigation, five cards and FAQ do not exist yet.

- [ ] **Step 3: Create the reusable icon component**

Create `web/src/app/landing-icons.tsx` as a pure SVG switch. Every returned `<svg>` must include `aria-hidden="true"`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth={1.8}`, `strokeLinecap="round"`, and `strokeLinejoin="round"`. Use these exact path groups:

```tsx
import type { ReactNode } from "react";
import type { LandingIconName } from "./landing-content";

const iconPaths: Record<LandingIconName, ReactNode> = {
  phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" /></>,
  calculator: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
  space: <><path d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
};

export function LandingIcon({ name }: { name: LandingIconName }) {
  return <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">{iconPaths[name]}</svg>;
}
```

- [ ] **Step 4: Build the Header and mobile disclosure**

Create `web/src/app/landing-header.tsx` with a logo link, desktop `<nav aria-label="เมนูหลัก">`, phone link, header CTA and native mobile `<details>`. Both navigation copies must map `content.navigation`; the active `เริ่มต้น` link receives `aria-current="page"`.

```tsx
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
        <Image alt={content.brand.logoAlt} className={styles.brandLogo} fill preload sizes="(max-width: 760px) 128px, 172px" src="/brand/ksb-architect-logo.png" />
      </Link>
      <nav aria-label="เมนูหลัก" className={styles.desktopNav}>{links}</nav>
      <div className={styles.headerActions}>
        <a aria-label={`${content.header.phoneLabel} ${content.header.phoneNumber}`} className={styles.phoneLink} href="tel:0919914592"><LandingIcon name="phone" /><span>{content.header.phoneNumber}</span></a>
        <Link className={styles.headerCta} href="/configurator">{content.header.ctaLabel}</Link>
        <details className={styles.mobileMenu}>
          <summary aria-label="เปิดเมนูหลัก"><LandingIcon name="menu" /></summary>
          <nav aria-label="เมนูหลักบนมือถือ">{links}<a href="tel:0919914592">{content.header.phoneNumber}</a></nav>
        </details>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Build static Floating Preview Cards**

Create `web/src/app/floating-preview-cards.tsx`. Render exactly five `<article>` elements inside `<div role="group" aria-label="ตัวอย่างหน้าจอวางแผนบ้าน">`. Use `next/image` for the three style thumbnails and share thumbnail. Use CSS custom property `--swatch` for material colors. Area slider, selected checks and share affordance must have `aria-hidden="true"`. Render `detailLabel` as `<span>`, never as a link or button.

```tsx
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
        <div className={styles.styleChoices}>{showcase.style.choices.map((choice, index) => <span className={styles.styleChoice} data-selected={index === 0} key={choice.label}><Image alt={`ตัวอย่างสไตล์ ${choice.label}`} fill sizes="92px" src={choice.image} />{index === 0 ? <i aria-hidden="true">✓</i> : null}</span>)}</div>
      </article></div>
      <div className={`${styles.cardFloat} ${styles.areaPosition}`}><article className={styles.previewCard}>
        <p>{showcase.area.label}</p><div className={styles.areaValue}><LandingIcon name="space" /><strong>{showcase.area.value}<small>{showcase.area.unit}</small></strong></div><span aria-hidden="true" className={styles.demoSlider}><i /></span>
      </article></div>
      <div className={`${styles.cardFloat} ${styles.materialPosition}`}><article className={styles.previewCard}>
        <p>{showcase.material.label}</p><strong>{showcase.material.selected}</strong><div className={styles.swatches}>{showcase.material.swatches.map((swatch, index) => <span aria-label={swatch.label} className={styles.swatch} data-selected={index === 0} key={swatch.label} style={{ "--swatch": swatch.color } as CSSProperties}>{index === 0 ? <i aria-hidden="true">✓</i> : null}</span>)}</div>
      </article></div>
      <div className={`${styles.cardFloat} ${styles.budgetPosition}`}><article className={`${styles.previewCard} ${styles.budgetCard}`}>
        <p>{showcase.budget.label}</p><strong>{showcase.budget.value}</strong><span>{showcase.budget.supporting}</span><span className={styles.detailAffordance}>{showcase.budget.detailLabel} →</span><small>{showcase.budget.disclaimer}</small>
      </article></div>
      <div className={`${styles.cardFloat} ${styles.sharePosition}`}><article className={`${styles.previewCard} ${styles.shareCard}`}>
        <div><strong>{showcase.share.title}</strong><span>{showcase.share.supporting}</span><LandingIcon name="share" /></div><span className={styles.shareThumb}><Image alt={showcase.share.imageAlt} fill sizes="160px" src="/concepts/contemporary-warm-luxury.png" /></span>
      </article></div>
    </div>
  );
}
```

- [ ] **Step 6: Build HouseShowcase, SimpleSteps, HeroSection and page composition**

Create `web/src/app/house-showcase.tsx`:

```tsx
import Image from "next/image";
import type { LandingContent } from "./landing-content";
import { FloatingPreviewCards } from "./floating-preview-cards";
import styles from "./landing-page.module.css";

export function HouseShowcase({ showcase }: { showcase: LandingContent["showcase"] }) {
  return (
    <div className={styles.houseArea} id="house-preview">
      <div className={styles.houseImage}>
        <Image alt={showcase.imageAlt} fill preload sizes="(max-width: 1023px) 100vw, 60vw" src="/concepts/contemporary-warm-luxury.png" />
      </div>
      <FloatingPreviewCards showcase={showcase} />
    </div>
  );
}
```

Create `web/src/app/simple-steps.tsx`:

```tsx
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
```

Create `web/src/app/hero-section.tsx`:

```tsx
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
        <h1 id="landing-heading"><span>{content.hero.headingLead}</span><strong>{content.hero.headingAccent}</strong></h1>
        <p className={styles.supportingCopy}>{content.hero.supportingCopy}</p>
        <p className={styles.explanation}>{content.hero.explanation}</p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryCta} href="/configurator"><LandingIcon name="calculator" />{content.hero.primaryCta}<LandingIcon name="arrow" /></Link>
          <a className={styles.secondaryCta} href="#house-preview"><LandingIcon name="eye" />{content.hero.secondaryCta}</a>
        </div>
      </div>
      <HouseShowcase showcase={content.showcase} />
      <div aria-label="ประโยชน์ของเครื่องมือ" className={styles.benefitRow}>
        {content.benefits.map((benefit) => <div key={benefit.label}><LandingIcon name={benefit.icon} /><span>{benefit.label}</span></div>)}
      </div>
      <SimpleSteps faqs={content.faqs} steps={content.steps} />
    </section>
  );
}
```

Use the following page composition so there is only one Hero `<section>`:

Replace `page.tsx` with:

```tsx
import { getLandingContent } from "./landing-content";
import { LandingHeader } from "./landing-header";
import { HeroSection } from "./hero-section";
import styles from "./landing-page.module.css";

export default function HomePage() {
  const content = getLandingContent();
  return <div className={styles.page}><LandingHeader content={content} /><main><HeroSection content={content} /></main></div>;
}
```

- [ ] **Step 7: Run component tests and verify GREEN**

Run: `npm test -- src/app/home-page.test.tsx src/app/landing-content.test.ts`

Expected: 4 tests PASS and no React accessibility warnings.

- [ ] **Step 8: Commit semantic components**

```powershell
git add web/src/app/page.tsx web/src/app/landing-content.ts web/src/app/landing-icons.tsx web/src/app/landing-header.tsx web/src/app/floating-preview-cards.tsx web/src/app/house-showcase.tsx web/src/app/simple-steps.tsx web/src/app/hero-section.tsx web/src/app/home-page.test.tsx
git commit -m "feat: build consumer configurator hero"
```

---

### Task 3: Rebuild the landing CSS for the reference composition

**Files:**
- Create: `web/src/app/landing-page-styles.test.ts`
- Modify: `web/src/app/landing-page.module.css`

**Interfaces:**
- Consumes: class names emitted by Task 2 components
- Produces: 40/60 desktop layout from 1024px, static-card placement, tablet/mobile normal flow through 1023px, visible focus and reduced-motion fallback

- [ ] **Step 1: Write the failing CSS contract test**

Create `web/src/app/landing-page-styles.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const css = readFileSync("src/app/landing-page.module.css", "utf8");

test("defines the approved floating-card motion and reduced-motion fallback", () => {
  expect(css).toMatch(/@keyframes\s+cardFloat/);
  expect(css).toMatch(/\.cardFloat\s*\{[^}]*animation:/s);
  expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*animation:\s*none/);
});

test("switches floating cards into normal flow through 1023px", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 1023px)"));
  expect(mobile).toMatch(/\.previewCards\s*\{[^}]*position:\s*static/s);
  expect(mobile).toMatch(/\.cardFloat\s*\{[^}]*position:\s*static/s);
  expect(mobile).toMatch(/\.hero\s*\{[^}]*grid-template-areas:\s*"content"\s*"house"\s*"benefits"\s*"steps"/s);
});

test("keeps touch targets and visible focus rings", () => {
  expect(css).toMatch(/\.primaryCta[\s\S]*min-height:\s*48px/);
  expect(css).toMatch(/:focus-visible[\s\S]*outline:/);
});
```

- [ ] **Step 2: Run the CSS contract test and verify RED**

Run: `npm test -- src/app/landing-page-styles.test.ts`

Expected: FAIL because the current CSS does not contain the new card classes, grid areas or `cardFloat` keyframes.

- [ ] **Step 3: Replace the landing stylesheet**

Rewrite `landing-page.module.css` with these exact structural rules, then add component-detail selectors using the approved tokens:

```css
.page {
  --hero-bg: #090908;
  --hero-surface: rgba(24, 21, 17, 0.88);
  --hero-gold: #d7b66f;
  --hero-gold-soft: #efd79d;
  --hero-ivory: #f5f1e9;
  --hero-muted: #aaa299;
  --hero-line: rgba(215, 182, 111, 0.3);
  min-height: 100svh;
  color: var(--hero-ivory);
  background: radial-gradient(circle at 58% 28%, rgba(215, 182, 111, 0.08), transparent 30%), var(--hero-bg);
}

.header {
  position: sticky;
  z-index: 30;
  top: 0;
  min-height: 92px;
  display: grid;
  grid-template-columns: minmax(150px, 0.55fr) minmax(430px, 1.4fr) minmax(330px, 0.85fr);
  align-items: center;
  gap: 28px;
  padding-inline: clamp(24px, 3.6vw, 64px);
  border-bottom: 1px solid var(--hero-line);
  background: rgba(9, 9, 8, 0.96);
  backdrop-filter: blur(12px);
}

.brand { position: relative; width: 172px; height: 70px; overflow: hidden; }
.brandLogo { object-fit: cover; object-position: 50% 60%; }
.desktopNav { display: flex; justify-content: center; gap: clamp(28px, 4vw, 72px); }
.desktopNav a { position: relative; min-height: 44px; display: inline-flex; align-items: center; color: var(--hero-muted); }
.desktopNav a[aria-current="page"] { color: var(--hero-ivory); }
.desktopNav a[aria-current="page"]::after { position: absolute; right: 22%; bottom: 0; left: 22%; height: 2px; content: ""; background: var(--hero-gold); }
.headerActions { display: flex; justify-content: flex-end; align-items: center; gap: 18px; }
.phoneLink, .headerCta { min-height: 48px; display: inline-flex; align-items: center; justify-content: center; }
.phoneLink { gap: 10px; color: var(--hero-gold-soft); }
.phoneLink svg { width: 20px; }
.headerCta { padding: 0 26px; color: #17120b; border: 1px solid var(--hero-gold); border-radius: 11px; background: linear-gradient(135deg, var(--hero-gold-soft), var(--hero-gold)); font-weight: 600; }
.mobileMenu { display: none; }

.hero {
  min-height: calc(100svh - 92px);
  display: grid;
  grid-template-areas: "content house" "benefits house" "steps house";
  grid-template-columns: minmax(440px, 40fr) minmax(650px, 60fr);
  grid-template-rows: auto auto auto;
  gap: 24px clamp(30px, 3.5vw, 66px);
  align-content: center;
  padding: clamp(42px, 5vh, 64px) clamp(24px, 3.6vw, 64px) clamp(34px, 4vh, 52px);
  overflow: hidden;
}

.heroContent { grid-area: content; align-self: end; max-width: 660px; }
.heroContent h1 { display: grid; gap: 2px; font-size: clamp(4rem, 5.1vw, 6.2rem); font-weight: 600; line-height: 1.06; letter-spacing: -0.05em; }
.heroContent h1 strong { color: var(--hero-gold); font-weight: 500; }
.supportingCopy { max-width: 590px; margin-top: 24px; color: var(--hero-ivory); font-size: clamp(1.2rem, 1.55vw, 1.65rem); line-height: 1.55; }
.explanation { max-width: 560px; margin-top: 26px; padding-top: 24px; color: var(--hero-muted); border-top: 1px solid var(--hero-line); line-height: 1.65; }
.heroActions { display: flex; gap: 16px; margin-top: 28px; }
.primaryCta, .secondaryCta { min-height: 48px; min-width: 210px; display: inline-flex; align-items: center; justify-content: center; gap: 20px; padding: 0 24px; border-radius: 10px; font-weight: 500; transition: transform 180ms ease, border-color 180ms ease, background-color 180ms ease; }
.primaryCta { color: #17120b; border: 1px solid var(--hero-gold); background: linear-gradient(135deg, var(--hero-gold-soft), var(--hero-gold)); }
.secondaryCta { color: var(--hero-ivory); border: 1px solid var(--hero-gold); background: rgba(9, 9, 8, 0.5); }
.primaryCta:hover, .secondaryCta:hover { transform: translateY(-2px); }

.houseArea { position: relative; grid-area: house; min-width: 0; min-height: 650px; align-self: stretch; }
.houseImage { position: absolute; inset: 0; overflow: hidden; border-radius: 0 0 0 64px; }
.houseImage::after { position: absolute; inset: 0; content: ""; background: linear-gradient(90deg, var(--hero-bg), transparent 22%), linear-gradient(180deg, transparent 58%, rgba(9, 9, 8, 0.8)); }
.houseImage img { object-fit: cover; object-position: 52% center; }
.previewCards { position: absolute; inset: 0; z-index: 3; }
.cardFloat { position: absolute; animation: cardFloat 9s ease-in-out infinite alternate; }
.stylePosition { top: 7%; left: 2%; width: min(280px, 33%); animation-duration: 8.4s; }
.areaPosition { top: 34%; left: 0; width: min(190px, 24%); animation-duration: 10.2s; animation-delay: -2s; }
.materialPosition { bottom: 12%; left: 4%; width: min(240px, 30%); animation-duration: 9.4s; animation-delay: -4s; }
.budgetPosition { top: 24%; right: 2%; width: min(250px, 30%); animation-duration: 7.8s; animation-delay: -1s; }
.sharePosition { right: 4%; bottom: 18%; width: min(310px, 38%); animation-duration: 10.8s; animation-delay: -5s; }
.previewCard { padding: 16px; color: var(--hero-ivory); border: 1px solid var(--hero-line); border-radius: 16px; background: var(--hero-surface); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.34); backdrop-filter: blur(9px); transition: transform 180ms ease, border-color 180ms ease; }
.previewCard:hover { transform: translateY(-3px); border-color: rgba(239, 215, 157, 0.65); }
.previewCard > p, .previewCard > span { color: var(--hero-muted); }

.benefitRow { grid-area: benefits; display: flex; flex-wrap: wrap; align-items: center; gap: 0; color: var(--hero-muted); }
.benefitRow > div { min-height: 38px; display: flex; align-items: center; gap: 9px; padding: 0 16px; border-right: 1px solid var(--hero-line); }
.benefitRow > div:first-child { padding-left: 0; }
.benefitRow > div:last-child { border-right: 0; }
.benefitRow svg { width: 19px; color: var(--hero-gold); }
.stepsArea { grid-area: steps; display: grid; gap: 10px; align-self: start; }
.stepsCard { padding: 15px 18px; border: 1px solid var(--hero-line); border-radius: 14px; background: rgba(20, 18, 15, 0.55); }
.stepsCard ol { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 12px; list-style: none; }
.faq { border-bottom: 1px solid var(--hero-line); color: var(--hero-muted); }
.faq summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; color: var(--hero-gold-soft); }
#house-preview, #how-it-works, #faq { scroll-margin-top: 108px; }

@keyframes cardFloat { from { transform: translate3d(0, -3px, 0); } to { transform: translate3d(0, 3px, 0); } }

@media (max-width: 1199px) {
  .header { grid-template-columns: 150px 1fr auto; gap: 18px; }
  .desktopNav { gap: 20px; }
  .hero { grid-template-columns: minmax(380px, 42fr) minmax(500px, 58fr); gap: 22px 28px; }
  .heroContent h1 { font-size: clamp(3.4rem, 5.2vw, 4.8rem); }
  .previewCard { padding: 13px; }
}

@media (max-width: 1023px) {
  .header { min-height: 78px; grid-template-columns: 130px 1fr; padding-inline: 20px; }
  .brand { width: 128px; height: 60px; }
  .desktopNav, .phoneLink { display: none; }
  .headerActions { gap: 10px; }
  .headerCta { min-height: 44px; padding: 0 14px; font-size: 0.82rem; }
  .mobileMenu { position: relative; display: block; }
  .mobileMenu summary { width: 44px; height: 44px; display: grid; place-items: center; color: var(--hero-gold-soft); border: 1px solid var(--hero-line); border-radius: 10px; cursor: pointer; list-style: none; }
  .mobileMenu summary svg { width: 22px; }
  .mobileMenu nav { position: absolute; top: 52px; right: 0; width: min(280px, calc(100vw - 40px)); display: grid; padding: 12px; border: 1px solid var(--hero-line); background: #11100e; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45); }
  .mobileMenu nav a { min-height: 46px; display: flex; align-items: center; padding: 0 12px; border-bottom: 1px solid rgba(215, 182, 111, 0.14); }
  .hero { grid-template-areas: "content" "house" "benefits" "steps"; grid-template-columns: minmax(0, 1fr); gap: 30px; padding: 46px clamp(20px, 5vw, 42px) 42px; overflow: visible; }
  .heroContent { max-width: 720px; }
  .houseArea { min-height: auto; display: grid; gap: 14px; }
  .houseImage { position: relative; aspect-ratio: 16 / 10; border-radius: 18px; }
  .houseImage::after { background: linear-gradient(180deg, transparent 55%, rgba(9, 9, 8, 0.64)); }
  .previewCards { position: static; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .cardFloat { position: static; width: auto; animation: none; }
  .stylePosition, .budgetPosition, .sharePosition { grid-column: 1 / -1; }
  .benefitRow { margin-top: 4px; }
}

@media (max-width: 599px) {
  .headerCta { display: none; }
  .heroContent h1 { font-size: clamp(3rem, 13vw, 4rem); }
  .supportingCopy { font-size: 1.1rem; }
  .heroActions { flex-direction: column; }
  .primaryCta, .secondaryCta { width: 100%; }
  .houseImage { aspect-ratio: 5 / 4; }
  .previewCards { grid-template-columns: 1fr; }
  .stylePosition, .budgetPosition, .sharePosition { grid-column: auto; }
  .benefitRow { align-items: stretch; flex-direction: column; }
  .benefitRow > div { width: 100%; padding: 7px 0; border-right: 0; border-bottom: 1px solid var(--hero-line); }
  .stepsCard ol { grid-template-columns: 1fr; }
}

.brand:focus-visible, .desktopNav a:focus-visible, .phoneLink:focus-visible, .headerCta:focus-visible, .mobileMenu summary:focus-visible, .mobileMenu nav a:focus-visible, .primaryCta:focus-visible, .secondaryCta:focus-visible, .faq summary:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .cardFloat, .previewCard, .primaryCta, .secondaryCta { animation: none; transition: none; transform: none; }
}
```

Add these exact supporting selectors before the responsive media queries:

```css
.previewCard > p { font-size: 0.76rem; line-height: 1.35; }
.previewCard > strong { display: block; margin-top: 3px; font-size: 1.08rem; font-weight: 600; }
.styleChoices { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 10px; }
.styleChoice { position: relative; aspect-ratio: 4 / 3; overflow: hidden; border: 1px solid rgba(245, 241, 233, 0.24); border-radius: 7px; }
.styleChoice[data-selected="true"] { border-color: var(--hero-gold); box-shadow: inset 0 0 0 1px var(--hero-gold); }
.styleChoice img { object-fit: cover; }
.styleChoice i { position: absolute; top: -5px; right: -5px; z-index: 2; width: 20px; height: 20px; display: grid; place-items: center; color: #17120b; border-radius: 50%; background: var(--hero-gold-soft); font-size: 0.65rem; font-style: normal; }
.areaValue { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
.areaValue svg { width: 38px; color: var(--hero-gold-soft); }
.areaValue strong { display: flex; align-items: baseline; gap: 5px; font-size: 2rem; line-height: 1; }
.areaValue small { font-size: 0.74rem; font-weight: 400; }
.demoSlider { position: relative; height: 2px; display: block; margin-top: 14px; background: rgba(245, 241, 233, 0.35); }
.demoSlider i { position: absolute; top: 50%; left: 68%; width: 11px; height: 11px; border-radius: 50%; background: var(--hero-gold); transform: translate(-50%, -50%); }
.swatches { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin-top: 10px; }
.swatch { position: relative; height: 38px; display: block; border: 1px solid rgba(245, 241, 233, 0.25); border-radius: 6px; background: var(--swatch); }
.swatch[data-selected="true"] { border-color: var(--hero-gold); }
.swatch i { position: absolute; right: -4px; bottom: -4px; width: 18px; height: 18px; display: grid; place-items: center; color: #17120b; border-radius: 50%; background: var(--hero-gold-soft); font-size: 0.62rem; font-style: normal; }
.budgetCard > strong { margin-top: 10px; color: var(--hero-ivory); font-size: clamp(1.35rem, 2vw, 2rem); }
.budgetCard > span { display: block; margin-top: 6px; font-size: 0.72rem; }
.budgetCard .detailAffordance { color: var(--hero-gold-soft); font-size: 0.78rem; font-weight: 500; }
.budgetCard > small { display: block; margin-top: 10px; padding-top: 8px; color: var(--hero-muted); border-top: 1px solid var(--hero-line); font-size: 0.63rem; }
.shareCard { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(96px, 1.2fr); gap: 12px; align-items: center; }
.shareCard > div { display: grid; gap: 4px; }
.shareCard > div > span { color: var(--hero-muted); font-size: 0.68rem; line-height: 1.4; }
.shareCard svg { width: 18px; margin-top: 4px; color: var(--hero-gold); }
.shareThumb { position: relative; aspect-ratio: 16 / 10; overflow: hidden; border-radius: 8px; }
.shareThumb img { object-fit: cover; }
.stepsCard h2 { color: var(--hero-gold-soft); font-size: 0.9rem; font-weight: 500; }
.stepList li { min-width: 0; display: grid; grid-template-columns: auto auto minmax(0, 1fr); gap: 9px; align-items: center; }
.stepNumber { width: 30px; height: 30px; display: grid; place-items: center; color: #17120b; border-radius: 50%; background: var(--hero-gold-soft); font-weight: 600; }
.stepList svg { width: 20px; color: var(--hero-gold-soft); }
.stepList li > div { display: grid; gap: 2px; }
.stepList strong { font-size: 0.78rem; }
.stepList li > div > span { color: var(--hero-muted); font-size: 0.62rem; line-height: 1.35; }
.faqAnswers { display: grid; gap: 12px; padding: 4px 0 16px; }
.faqAnswer { display: grid; gap: 4px; }
.faqAnswer dt { color: var(--hero-ivory); font-size: 0.8rem; font-weight: 500; }
.faqAnswer dd { color: var(--hero-muted); font-size: 0.76rem; line-height: 1.55; }
```

- [ ] **Step 4: Run CSS and component tests and verify GREEN**

Run: `npm test -- src/app/landing-page-styles.test.ts src/app/home-page.test.tsx src/app/landing-content.test.ts`

Expected: 7 tests PASS.

- [ ] **Step 5: Commit the reference-faithful styles**

```powershell
git add web/src/app/landing-page.module.css web/src/app/landing-page-styles.test.ts
git commit -m "style: match consumer hero reference"
```

---

### Task 4: Add browser acceptance and visual QA evidence

**Files:**
- Modify: `web/src/e2e/home-page.e2e.ts`
- Create: `docs/qa/screenshots/consumer-hero-desktop-1440x900.png`
- Create: `docs/qa/screenshots/consumer-hero-tablet-768x1024.png`
- Create: `docs/qa/screenshots/consumer-hero-mobile-375x812.png`

**Interfaces:**
- Consumes: the production-like Landing page from Tasks 1–3
- Produces: navigation, overflow, focus, reduced-motion and visual evidence

- [ ] **Step 1: Replace E2E acceptance with the approved journey**

Update `web/src/e2e/home-page.e2e.ts` to test:

```ts
import { expect, test } from "@playwright/test";

test("communicates the consumer value and enters the configurator", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "บ้านในฝันของคุณ ราคาเท่าไหร่?" })).toBeVisible();
  await expect(page.getByRole("img", { name: /บ้านร่วมสมัยแสงอบอุ่น/ })).toBeVisible();
  await expect(page.getByText("ตัวอย่างหน้าจอ · ไม่ใช่ราคาประเมิน")).toBeVisible();
  await expect(page.getByRole("heading", { name: "3 ขั้นตอนง่าย ๆ เพื่อบ้านในฝัน" })).toBeInViewport();
  const primary = page.getByRole("link", { name: "เริ่มประเมินฟรี" });
  await expect(primary).toBeInViewport();
  await primary.click();
  await expect(page).toHaveURL(/\/configurator$/);
  await expect(page.getByRole("heading", { name: "เลือกสไตล์บ้าน" })).toBeVisible();
});

for (const viewport of [{ width: 768, height: 1024 }, { width: 375, height: 812 }]) {
  test(`keeps the hero usable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const dimensions = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    const primary = page.getByRole("link", { name: "เริ่มประเมินฟรี" });
    expect((await primary.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
    await expect(page.getByRole("group", { name: "ตัวอย่างหน้าจอวางแผนบ้าน" })).toBeVisible();
  });
}

test("exposes focus and disables decorative motion when requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const focusTargets = [
    page.getByRole("link", { name: "KSB Architect หน้าแรก" }),
    page.getByRole("link", { name: "เริ่มต้น" }),
    page.getByRole("link", { name: "โทรปรึกษา 091 991 4592" }),
    page.getByRole("link", { name: "ลองประเมินฟรี" }),
    page.getByRole("link", { name: "เริ่มประเมินฟรี" }),
    page.getByRole("link", { name: "ดูตัวอย่างบ้าน" }),
    page.locator("details#faq > summary"),
  ];
  for (const target of focusTargets) {
    await target.focus();
    expect(await target.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  }
  const animation = await page.locator("[class*='cardFloat']").first().evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toBe("none");
  await page.setViewportSize({ width: 375, height: 812 });
  const mobileMenu = page.locator("header details > summary");
  await mobileMenu.focus();
  expect(await mobileMenu.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
});
```

- [ ] **Step 2: Run focused E2E and verify behavior**

Run: `npm run test:e2e -- src/e2e/home-page.e2e.ts`

Expected: 4 tests PASS.

- [ ] **Step 3: Run the full automated verification**

Run each command from `web/`:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e -- src/e2e/home-page.e2e.ts
```

Expected: every command exits `0`, all test files pass, and Next.js builds route `/` successfully.

- [ ] **Step 4: Capture and inspect the three required viewport screenshots**

Start the local app, then capture `/` at `1440×900`, `768×1024`, and `375×812` to the exact paths listed in this task. For each viewport record:

- `document.documentElement.scrollWidth <= clientWidth`
- computed body font includes `Prompt`
- visible Hero H1 and primary CTA
- five overlay cards at `>=1024px`; normal-flow cards through `1023px` on tablet/mobile
- no card covers the main roofline, entry or headline
- console contains no Landing-originated error/warning

If a defect is found, add a failing unit/CSS/E2E regression test before changing production code, then rerun Step 3.

- [ ] **Step 5: Run final fresh verification and commit QA evidence**

Run:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

Expected: all commands exit `0`, then commit:

```powershell
git add web/src/e2e/home-page.e2e.ts docs/qa/screenshots/consumer-hero-desktop-1440x900.png docs/qa/screenshots/consumer-hero-tablet-768x1024.png docs/qa/screenshots/consumer-hero-mobile-375x812.png
git commit -m "test: verify consumer configurator hero"
```
