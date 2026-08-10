# Premium Architect Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยนหน้า `/` จากข้อความ HTML ดิบให้เป็น Premium Architect Landing ที่อธิบายคุณค่าของ Configurator และพาผู้ใช้เริ่มวางแผนบ้านได้อย่างชัดเจนบน Desktop/Mobile

**Architecture:** คงหน้า Landing เป็น Next.js Server Component โดยแยกข้อความไว้ใน `landing-content.ts` และแยก presentation ไว้ใน CSS Module เฉพาะหน้า ไม่มี client state, API call หรือ dependency ใหม่ การเปลี่ยนแปลงยึด TDD: ขยาย contract tests และ E2E ก่อน แล้วจึงเพิ่มโครงสร้างและ style ที่จำเป็น

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, next/image, Vitest, Testing Library, Playwright, axe-core

## Global Constraints

- ภาษาในหน้าผู้ใช้เป็นภาษาไทย ยกเว้น brand/utility labels `KSB ARCHITECT`, `HOME PLANNING STUDIO`, `PROJECT BRIEF / 01`, `CONCEPT STUDY` และ `PRELIMINARY`
- ใช้ภาพ `/concepts/contemporary-warm-luxury.png` และต้องไม่อ้างว่าเป็นผลงานก่อสร้างจริงของ KSB
- Primary CTA คือ `เริ่มวางแผนบ้าน` และต้องไปที่ `/configurator`
- Preview แรกต้องสื่อว่าไม่ต้องกรอกข้อมูลส่วนตัว
- ต้องแสดงคำกำกับว่าเป็นการประเมินเบื้องต้น ไม่ใช่แบบก่อสร้าง ใบเสนอราคา หรือราคาผูกพัน
- ห้ามเพิ่ม dependency, API, database schema, client state หรือ animation library
- รองรับ viewport 360px โดยไม่มี horizontal overflow และ touch target หลักสูงอย่างน้อย 44px
- ใช้ `prefers-reduced-motion`, `:focus-visible`, semantic landmarks และ WCAG AA เป็นเกณฑ์ขั้นต่ำ

**TDD sequencing note:** หลังเขียน failing tests ใน Task 2 Step 1 ให้เขียนและรัน Responsive E2E ใน Task 3 Steps 1–2 ก่อนทำ Task 2 Step 3 เพื่อให้ทั้ง semantic behavior และ browser layout มี RED evidence ก่อน production implementation จากนั้นจึงกลับมาทำ Task 2 ให้ GREEN และทำ Task 3 ที่เหลือต่อ

---

### Task 1: ขยาย Landing Content Contract

**Files:**
- Modify: `web/src/app/landing-content.test.ts`
- Modify: `web/src/app/landing-content.ts`

**Interfaces:**
- Consumes: `getLandingContent(locale?: LandingLocale): LandingContent`
- Produces: `LandingContent` ที่มีข้อความ Header, Hero, Value Rail, Process, Scope และ Final CTA ครบสำหรับ Server Component

- [ ] **Step 1: เขียน failing content contract test**

แทนที่ `web/src/app/landing-content.test.ts` ด้วย:

```ts
import { getLandingContent } from "./landing-content";

test("provides the complete Thai premium landing content", () => {
  const content = getLandingContent("th");

  expect(content).toMatchObject({
    brand: "KSB ARCHITECT",
    productLabel: "HOME PLANNING STUDIO",
    contactLabel: "ปรึกษาสถาปนิก",
    contactNumber: "091 991 4592",
    eyebrow: "บริการวางแผนบ้านโดยสถาปนิก",
    heading: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง",
    primaryCta: "เริ่มวางแผนบ้าน",
    secondaryCta: "ดูขั้นตอนการใช้งาน",
    conceptLabel: "Contemporary Warm Luxury",
    processHeading: "จากความต้องการ สู่กรอบโครงการที่คุยกับสถาปนิกได้",
    finalHeading: "บ้านที่อยู่ได้จริง เริ่มจาก Brief ที่ชัดเจน",
  });
  expect(content.helper).toContain("ไม่ต้องกรอกข้อมูลส่วนตัว");
  expect(content.scopeNote).toContain("ไม่ใช่แบบก่อสร้าง");
  expect(content.values).toHaveLength(3);
  expect(content.processSteps).toHaveLength(3);
});

test("falls back to Thai for an untranslated locale", () => {
  expect(getLandingContent("en")).toEqual(getLandingContent("th"));
});
```

- [ ] **Step 2: รัน test และยืนยันว่า fail เพราะ field ใหม่ยังไม่มี**

Run: `npm test -- src/app/landing-content.test.ts`

Expected: FAIL โดย `content.brand`, `content.primaryCta` หรือ field ใหม่เป็น `undefined`

- [ ] **Step 3: เพิ่ม content model และข้อความจริง**

แทนที่ `web/src/app/landing-content.ts` ด้วย:

```ts
export type LandingLocale = "th" | "en";

type LandingItem = {
  number: string;
  title: string;
  description: string;
};

export type LandingContent = {
  brand: string;
  productLabel: string;
  contactLabel: string;
  contactNumber: string;
  eyebrow: string;
  heading: string;
  statement: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  helper: string;
  conceptAlt: string;
  conceptLabel: string;
  values: LandingItem[];
  processEyebrow: string;
  processHeading: string;
  processDescription: string;
  processSteps: LandingItem[];
  scopeLabel: string;
  scopeNote: string;
  finalEyebrow: string;
  finalHeading: string;
  finalDescription: string;
  finalCta: string;
  contactCta: string;
  footerNote: string;
};

const defaultLandingLocale: LandingLocale = "th";

const landingContent: Partial<Record<LandingLocale, LandingContent>> = {
  th: {
    brand: "KSB ARCHITECT",
    productLabel: "HOME PLANNING STUDIO",
    contactLabel: "ปรึกษาสถาปนิก",
    contactNumber: "091 991 4592",
    eyebrow: "บริการวางแผนบ้านโดยสถาปนิก",
    heading: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง",
    statement: "บ้านหรูไม่ได้เริ่มจากวัสดุแพง แต่เริ่มจากการวางแผนพื้นที่ ฟังก์ชัน และกรอบงบประมาณให้สอดคล้องกัน",
    description: "เลือกความต้องการทีละขั้น เพื่อดู Concept Preview พื้นที่ใช้สอยที่แนะนำ และกรอบงบประมาณเบื้องต้นได้ก่อนให้ข้อมูลติดต่อ",
    primaryCta: "เริ่มวางแผนบ้าน",
    secondaryCta: "ดูขั้นตอนการใช้งาน",
    helper: "ใช้เวลาประมาณ 3–5 นาที · Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว",
    conceptAlt: "ภาพแนวคิดบ้านสไตล์ Contemporary Warm Luxury สำหรับประกอบการวางแผน",
    conceptLabel: "Contemporary Warm Luxury",
    values: [
      { number: "01", title: "กำหนดความต้องการ", description: "เลือกสไตล์ จำนวนห้อง ทำเล และระดับวัสดุ" },
      { number: "02", title: "เห็นกรอบโครงการ", description: "ดูพื้นที่ใช้สอย พื้นที่ก่อสร้าง และช่วงงบประมาณเบื้องต้น" },
      { number: "03", title: "คุยกับสถาปนิกต่อได้", description: "ใช้ข้อมูลสรุปเป็นจุดเริ่มต้นของการปรึกษาอย่างเป็นระบบ" },
    ],
    processEyebrow: "GUIDED ARCHITECT EXPERIENCE",
    processHeading: "จากความต้องการ สู่กรอบโครงการที่คุยกับสถาปนิกได้",
    processDescription: "ไม่จำเป็นต้องรู้ศัพท์สถาปัตยกรรม ระบบจะพาเลือกเฉพาะข้อมูลที่มีผลต่อการวางแผนบ้าน และคุณย้อนกลับไปแก้ไขได้ทุกขั้น",
    processSteps: [
      { number: "01", title: "เลือกตามภาพและการใช้งานจริง", description: "บอกสไตล์ ฟังก์ชัน จำนวนห้อง ทำเล และระดับวัสดุที่สอดคล้องกับชีวิตของคุณ" },
      { number: "02", title: "ระบบสรุปพื้นที่และกรอบงบประมาณ", description: "เห็นพื้นที่ใช้สอย พื้นที่ก่อสร้าง และปัจจัยที่มีผลต่อช่วงงบประมาณอย่างเป็นหมวดหมู่" },
      { number: "03", title: "ดู Preview ก่อนตัดสินใจปรึกษาต่อ", description: "รับภาพรวมโครงการก่อนให้ข้อมูลติดต่อ แล้วค่อยเลือกว่าจะรับสรุปฉบับเต็มหรือปรึกษาสถาปนิก" },
    ],
    scopeLabel: "ขอบเขตของผลลัพธ์",
    scopeNote: "ผลลัพธ์เป็นการประเมินเบื้องต้นเพื่อช่วยวางแผน ไม่ใช่แบบก่อสร้าง ใบเสนอราคา หรือราคาผูกพัน",
    finalEyebrow: "START WITH A CLEAR BRIEF",
    finalHeading: "บ้านที่อยู่ได้จริง เริ่มจาก Brief ที่ชัดเจน",
    finalDescription: "จัดกรอบความต้องการให้เห็นภาพก่อนเริ่มออกแบบจริง เพื่อให้ทุกการตัดสินใจคุยกันบนข้อมูลชุดเดียวกัน",
    finalCta: "เริ่มวางแผนบ้าน",
    contactCta: "ปรึกษาฟรี 091 991 4592",
    footerNote: "บริการออกแบบบ้าน สถาปัตยกรรม และวางแผนโครงการอย่างมืออาชีพ",
  },
};

export function getLandingContent(locale: LandingLocale = defaultLandingLocale): LandingContent {
  return landingContent[locale] ?? landingContent[defaultLandingLocale]!;
}
```

- [ ] **Step 4: รัน content test และยืนยันว่า pass**

Run: `npm test -- src/app/landing-content.test.ts`

Expected: PASS 2 tests

- [ ] **Step 5: Commit content contract**

```powershell
git add -- web/src/app/landing-content.ts web/src/app/landing-content.test.ts
git commit -m "feat: expand premium landing content"
```

---

### Task 2: สร้าง Semantic Premium Landing

**Files:**
- Modify: `web/src/app/home-page.test.tsx`
- Modify: `web/src/app/page.tsx`
- Create: `web/src/app/landing-page.module.css`

**Interfaces:**
- Consumes: `getLandingContent(): LandingContent`, `/concepts/contemporary-warm-luxury.png`, Next.js `Link` และ `Image`
- Produces: Server-rendered `/` พร้อม Header, Hero, Value Rail, Process, Scope Note, Final CTA และ Footer

- [ ] **Step 1: เขียน failing semantic page test**

แทนที่ `web/src/app/home-page.test.tsx` ด้วย:

```tsx
import { render, screen, within } from "@testing-library/react";
import HomePage from "./page";

test("presents the planning value before asking for contact data", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { name: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง" })).toBeInTheDocument();
  expect(screen.getByText(/Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว/)).toBeInTheDocument();
  const planningLinks = screen.getAllByRole("link", { name: "เริ่มวางแผนบ้าน" });
  expect(planningLinks).toHaveLength(2);
  planningLinks.forEach((link) => expect(link).toHaveAttribute("href", "/configurator"));
  expect(screen.getByRole("link", { name: "ดูขั้นตอนการใช้งาน" })).toHaveAttribute("href", "#process");
});

test("exposes the process, estimate scope and architect contact", () => {
  render(<HomePage />);

  const process = screen.getByRole("region", { name: "จากความต้องการ สู่กรอบโครงการที่คุยกับสถาปนิกได้" });
  expect(within(process).getAllByRole("heading", { level: 3 })).toHaveLength(3);
  expect(screen.getByText(/ไม่ใช่แบบก่อสร้าง ใบเสนอราคา หรือราคาผูกพัน/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "ปรึกษาสถาปนิก 091 991 4592" })).toHaveAttribute("href", "tel:0919914592");
  expect(screen.getByAltText(/ภาพแนวคิดบ้านสไตล์ Contemporary Warm Luxury/)).toBeInTheDocument();
});
```

- [ ] **Step 2: รัน test และยืนยันว่า fail จาก UI ที่ยังไม่มี**

Run: `npm test -- src/app/home-page.test.tsx`

Expected: FAIL เพราะไม่พบ link `เริ่มวางแผนบ้าน`, process region และภาพแนวคิด

- [ ] **Step 3: สร้าง Server Component ตาม semantic structure**

แทนที่ `web/src/app/page.tsx` ด้วย implementation ที่:

```tsx
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
        <a aria-label={`${content.contactLabel} ${content.contactNumber}`} className={styles.headerContact} href="tel:0919914592">
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
              <Link className={styles.primaryCta} href="/configurator">{content.primaryCta}<span aria-hidden="true">↗</span></Link>
              <a className={styles.secondaryCta} href="#process">{content.secondaryCta}<span aria-hidden="true">↓</span></a>
            </div>
            <p className={styles.helper}>{content.helper}</p>
          </div>

          <div className={styles.visual}>
            <div className={styles.imageFrame}>
              <Image alt={content.conceptAlt} fill preload sizes="(max-width: 899px) 100vw, 55vw" src="/concepts/contemporary-warm-luxury.png" />
              <span aria-hidden="true" className={styles.crosshairHorizontal} />
              <span aria-hidden="true" className={styles.crosshairVertical} />
              <div className={styles.imageIndex}><span>01</span><small>CURATED CONCEPT</small></div>
              <div className={styles.briefingPlate}>
                <div><span>PROJECT BRIEF / 01</span><strong>{content.conceptLabel}</strong></div>
                <div><span>STUDY</span><strong>CONCEPT</strong></div>
                <div><span>STATUS</span><strong>PRELIMINARY</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="สิ่งที่คุณจะได้รับ" className={styles.valueRail}>
          {content.values.map((item) => (
            <article className={styles.valueItem} key={item.number}>
              <span>{item.number}</span>
              <div><h2>{item.title}</h2><p>{item.description}</p></div>
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
              <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></article>
            ))}
          </div>
          <aside className={styles.scopeNote}>
            <p>{content.scopeLabel}</p><strong>{content.scopeNote}</strong>
          </aside>
        </section>

        <section aria-labelledby="final-heading" className={styles.finalCtaSection}>
          <div><p className={styles.sectionEyebrow}>{content.finalEyebrow}</p><h2 id="final-heading">{content.finalHeading}</h2></div>
          <div><p>{content.finalDescription}</p><div className={styles.actions}><Link className={styles.primaryCta} href="/configurator">{content.finalCta}<span aria-hidden="true">↗</span></Link><a className={styles.secondaryCta} href="tel:0919914592">{content.contactCta}</a></div></div>
        </section>
      </main>

      <footer className={styles.footer}><strong>{content.brand}</strong><p>{content.footerNote}</p><span>© 2026 KSB Architect</span></footer>
    </div>
  );
}
```

- [ ] **Step 4: สร้าง CSS Module ให้ตรงกับ Visual Spec**

สร้าง `web/src/app/landing-page.module.css` โดยใช้ selector จาก `page.tsx` และกำหนด:

```css
.page { min-height: 100%; color: var(--ivory); background: var(--obsidian); }
.page::before { position: fixed; z-index: 0; inset: 0; pointer-events: none; content: ""; opacity: .2; background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 96px 96px; mask-image: linear-gradient(to bottom, #000, transparent 76%); }
.header, .hero, .valueRail, .process, .finalCtaSection, .footer { position: relative; z-index: 1; width: min(1440px, 100%); margin-inline: auto; padding-inline: clamp(20px, 4vw, 68px); }
.header { min-height: 88px; display: flex; align-items: center; justify-content: space-between; gap: 24px; border-bottom: 1px solid var(--line); }
.brand { display: grid; gap: 3px; }
.brand strong { font-size: .8rem; letter-spacing: .18em; }
.brand span, .headerContact span { color: var(--muted); font-size: .68rem; letter-spacing: .14em; }
.headerContact { min-height: 44px; display: flex; align-items: center; gap: 14px; padding-left: 20px; border-left: 1px solid var(--line); }
.headerContact strong { color: var(--gold-light); font-size: .88rem; }
.hero { min-height: calc(100svh - 88px); display: grid; grid-template-columns: minmax(0, .88fr) minmax(480px, 1.12fr); gap: clamp(42px, 6vw, 96px); align-items: center; padding-block: clamp(38px, 5vw, 72px); }
.heroCopy { min-width: 0; }
.heroMeta { display: flex; justify-content: space-between; gap: 20px; color: var(--gold-light); font-size: .7rem; font-weight: 700; letter-spacing: .12em; }
.heroMeta span { color: var(--muted); }
.hero h1 { max-width: 760px; margin-top: clamp(22px, 3vw, 40px); font-size: clamp(3rem, 5.2vw, 5.65rem); font-weight: 350; line-height: 1.02; letter-spacing: -.055em; text-wrap: balance; }
.statement { max-width: 650px; margin-top: 28px; color: var(--gold-light); font-size: clamp(1.05rem, 1.5vw, 1.28rem); line-height: 1.65; }
.description { max-width: 620px; margin-top: 14px; color: var(--muted); font-size: .98rem; line-height: 1.75; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 30px; }
.primaryCta, .secondaryCta { min-height: 50px; display: inline-flex; align-items: center; justify-content: center; gap: 18px; padding: 0 22px; border: 1px solid var(--line); font-weight: 700; }
.primaryCta { color: #17120c; border-color: var(--gold); background: var(--gold); }
.primaryCta:hover { background: var(--gold-light); }
.secondaryCta { color: var(--ivory); background: rgba(9, 8, 7, .36); }
.primaryCta:focus-visible, .secondaryCta:focus-visible, .brand:focus-visible, .headerContact:focus-visible { outline: 3px solid var(--focus); outline-offset: 4px; }
.helper { margin-top: 15px; color: var(--muted); font-size: .78rem; }
.visual { min-width: 0; }
.imageFrame { position: relative; min-height: clamp(480px, 68svh, 720px); overflow: hidden; border: 1px solid var(--line); background: var(--surface); box-shadow: 22px 24px 0 rgba(217, 178, 109, .055); }
.imageFrame::after { position: absolute; inset: 0; content: ""; background: linear-gradient(180deg, rgba(9,8,7,.08), rgba(9,8,7,.02) 55%, rgba(9,8,7,.72)); }
.imageFrame img { object-fit: cover; }
.crosshairHorizontal, .crosshairVertical { position: absolute; z-index: 2; display: block; background: rgba(243,238,229,.48); }
.crosshairHorizontal { top: 23%; left: 0; width: 46px; height: 1px; }
.crosshairVertical { top: 0; left: 23%; width: 1px; height: 46px; }
.imageIndex { position: absolute; z-index: 3; top: 20px; right: 20px; display: grid; justify-items: end; color: var(--ivory); }
.imageIndex span { font-size: 2rem; font-weight: 300; line-height: 1; }
.imageIndex small { margin-top: 5px; font-size: .58rem; letter-spacing: .16em; }
.briefingPlate { position: absolute; z-index: 3; right: 20px; bottom: 20px; left: 20px; display: grid; grid-template-columns: 1.5fr .6fr .6fr; border: 1px solid rgba(243,238,229,.5); background: rgba(9,8,7,.78); backdrop-filter: blur(10px); }
.briefingPlate > div { min-width: 0; display: grid; gap: 5px; padding: 12px 14px; }
.briefingPlate > div + div { border-left: 1px solid rgba(243,238,229,.28); }
.briefingPlate span { color: var(--muted); font-size: .55rem; letter-spacing: .13em; }
.briefingPlate strong { overflow: hidden; font-size: .7rem; letter-spacing: .06em; text-overflow: ellipsis; white-space: nowrap; }
.valueRail { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.valueItem { display: grid; grid-template-columns: auto 1fr; gap: 18px; padding-block: 28px; }
.valueItem + .valueItem { padding-left: clamp(20px, 3vw, 44px); border-left: 1px solid var(--line); }
.valueItem > span, .processSteps article > span { color: var(--gold); font-size: .72rem; font-weight: 700; letter-spacing: .12em; }
.valueItem h2 { font-size: 1rem; }
.valueItem p { max-width: 310px; margin-top: 6px; color: var(--muted); font-size: .82rem; line-height: 1.55; }
.process { display: grid; grid-template-columns: minmax(280px, .8fr) minmax(0, 1.2fr); gap: clamp(48px, 8vw, 120px); padding-block: clamp(84px, 10vw, 150px); }
.sectionEyebrow { color: var(--gold-light); font-size: .68rem; font-weight: 700; letter-spacing: .15em; }
.processIntro h2, .finalCtaSection h2 { margin-top: 18px; font-size: clamp(2.25rem, 4vw, 4.25rem); font-weight: 350; line-height: 1.08; letter-spacing: -.04em; text-wrap: balance; }
.processIntro > p:last-child { max-width: 590px; margin-top: 24px; color: var(--muted); line-height: 1.75; }
.processSteps { display: grid; border-top: 1px solid var(--line); }
.processSteps article { display: grid; grid-template-columns: 44px minmax(160px, .8fr) minmax(220px, 1.2fr); gap: 22px; padding: 26px 0; border-bottom: 1px solid var(--line); }
.processSteps h3 { font-size: 1.08rem; line-height: 1.45; }
.processSteps p { color: var(--muted); font-size: .9rem; line-height: 1.7; }
.scopeNote { grid-column: 2; display: grid; grid-template-columns: 160px 1fr; gap: 24px; padding: 24px; border-left: 2px solid var(--gold); background: var(--surface); }
.scopeNote p { color: var(--gold-light); font-size: .7rem; font-weight: 700; letter-spacing: .1em; }
.scopeNote strong { font-size: .92rem; line-height: 1.65; }
.finalCtaSection { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(48px, 8vw, 120px); align-items: end; padding-block: clamp(64px, 8vw, 112px); border-top: 1px solid var(--line); }
.finalCtaSection > div:last-child > p { max-width: 560px; color: var(--muted); line-height: 1.75; }
.footer { min-height: 96px; display: grid; grid-template-columns: .7fr 1.3fr auto; gap: 24px; align-items: center; border-top: 1px solid var(--line); color: var(--muted); font-size: .74rem; }
.footer strong { color: var(--ivory); letter-spacing: .14em; }
@media (max-width: 1020px) { .hero { grid-template-columns: minmax(0, .9fr) minmax(400px, 1.1fr); gap: 36px; } .hero h1 { font-size: clamp(3rem, 5.8vw, 4.7rem); } .process { grid-template-columns: 1fr; } .scopeNote { grid-column: 1; } }
@media (max-width: 760px) { .page::before { background-size: 64px 64px; } .header { min-height: 76px; } .headerContact span { display: none; } .hero { min-height: auto; grid-template-columns: 1fr; gap: 36px; padding-block: 42px 64px; } .hero h1 { font-size: clamp(2.8rem, 13vw, 4.5rem); } .visual { grid-row: 2; } .imageFrame { min-height: clamp(390px, 118vw, 560px); } .valueRail { grid-template-columns: 1fr; } .valueItem { padding-block: 22px; } .valueItem + .valueItem { padding-left: 0; border-top: 1px solid var(--line); border-left: 0; } .processSteps article { grid-template-columns: 38px 1fr; } .processSteps p { grid-column: 2; } .scopeNote { grid-template-columns: 1fr; gap: 10px; } .finalCtaSection { grid-template-columns: 1fr; align-items: start; } .footer { grid-template-columns: 1fr; gap: 8px; padding-block: 28px; } }
@media (max-width: 430px) { .headerContact strong { font-size: .75rem; } .brand span { font-size: .55rem; } .heroMeta { display: grid; } .hero h1 { font-size: clamp(2.65rem, 14vw, 3.6rem); } .actions { align-items: stretch; flex-direction: column; } .primaryCta, .secondaryCta { width: 100%; } .briefingPlate { right: 12px; bottom: 12px; left: 12px; grid-template-columns: 1fr 1fr; } .briefingPlate > div:first-child { grid-column: 1 / -1; border-bottom: 1px solid rgba(243,238,229,.28); } .briefingPlate > div:nth-child(2) { border-left: 0; } }
@media (prefers-reduced-motion: reduce) { .primaryCta, .secondaryCta { transition: none; } }
```

- [ ] **Step 5: รัน page tests และยืนยันว่า pass**

Run: `npm test -- src/app/home-page.test.tsx src/app/landing-content.test.ts`

Expected: PASS 4 tests

- [ ] **Step 6: Commit semantic landing**

```powershell
git add -- web/src/app/page.tsx web/src/app/landing-page.module.css web/src/app/home-page.test.tsx
git commit -m "feat: build premium architect landing page"
```

---

### Task 3: เพิ่ม Responsive E2E และ Accessibility Regression

**Files:**
- Modify: `web/src/e2e/home-page.e2e.ts`
- Verify: `web/src/e2e/privacy-accessibility.e2e.ts`

**Interfaces:**
- Consumes: หน้า `/` และเส้นทาง `/configurator`
- Produces: regression coverage สำหรับ CTA navigation, mobile overflow และ touch target

- [ ] **Step 1: เขียน E2E test สำหรับ flow และ mobile layout**

แทนที่ `web/src/e2e/home-page.e2e.ts` ด้วย:

```ts
import { expect, test } from "@playwright/test";

test("explains the planning value and enters the Thai configurator", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("KSB Architect | Smart Home Design Configurator");
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  await expect(page.getByRole("heading", { name: "รู้พื้นที่และงบประมาณบ้านก่อนเริ่มสร้าง" })).toBeVisible();
  await expect(page.getByText(/Preview แรกไม่ต้องกรอกข้อมูลส่วนตัว/)).toBeVisible();
  await expect(page.getByAltText(/ภาพแนวคิดบ้านสไตล์ Contemporary Warm Luxury/)).toBeVisible();

  const primaryCta = page.getByRole("link", { name: "เริ่มวางแผนบ้าน" }).first();
  await expect(primaryCta).toHaveAttribute("href", "/configurator");
  await primaryCta.click();
  await expect(page).toHaveURL(/\/configurator$/);
  await expect(page.getByRole("heading", { name: "เลือกสไตล์บ้าน" })).toBeVisible();
});

test("keeps the landing usable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  const primaryCta = page.getByRole("link", { name: "เริ่มวางแผนบ้าน" }).first();
  const box = await primaryCta.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

  await page.getByRole("link", { name: "ดูขั้นตอนการใช้งาน" }).click();
  await expect(page).toHaveURL(/#process$/);
  await expect(page.getByRole("region", { name: "จากความต้องการ สู่กรอบโครงการที่คุยกับสถาปนิกได้" })).toBeInViewport();
});
```

- [ ] **Step 2: พิสูจน์ว่า regression test จับหน้าเดิมได้**

ก่อน implementation ของ Task 2 ให้รัน test นี้กับหน้าเดิม หรือยืนยันจาก RED run ที่เก็บไว้ว่า test แรก fail เพราะไม่พบ CTA/ภาพใหม่ จากนั้นหลัง implementation ห้ามเปลี่ยน assertion ให้ผ่านตามโค้ด

Run: `npx playwright test src/e2e/home-page.e2e.ts`

Expected before implementation: FAIL เพราะไม่พบ `เริ่มวางแผนบ้าน` หรือภาพ Concept

- [ ] **Step 3: รัน focused E2E หลัง implementation**

Run: `npx playwright test src/e2e/home-page.e2e.ts`

Expected: PASS 2 tests

- [ ] **Step 4: รัน Accessibility E2E ที่สแกน Landing ด้วย axe**

Run: `npx playwright test src/e2e/privacy-accessibility.e2e.ts --grep "keeps the public journey accessible"`

Expected: PASS และไม่มี serious/critical WCAG violations

- [ ] **Step 5: Commit E2E coverage**

```powershell
git add -- web/src/e2e/home-page.e2e.ts
git commit -m "test: cover premium landing journey"
```

---

### Task 4: Visual QA และ Full Verification

**Files:**
- Modify if a failing visual requirement is found: `web/src/app/landing-page.module.css`
- Verify: all changed files and the full application

**Interfaces:**
- Consumes: built Landing Page และ dev server ที่ `http://127.0.0.1:3000`
- Produces: verified Desktop/Mobile screenshots และ clean release evidence

- [ ] **Step 1: รัน static verification**

Run: `npm run typecheck`

Expected: exit 0, no TypeScript errors

Run: `npm run lint`

Expected: exit 0, no ESLint errors

Run: `npm run build`

Expected: exit 0, route `/` builds successfully

- [ ] **Step 2: รัน full automated suite**

Run: `npm test`

Expected: all Vitest files and tests pass

Run: `npm run test:e2e`

Expected: all Playwright tests pass

- [ ] **Step 3: จับและตรวจ Desktop screenshot**

Run: `npx playwright screenshot --viewport-size="1366,768" http://127.0.0.1:3000 artifacts/landing-desktop-1366.png`

ตรวจว่า H1, Primary CTA, helper copy และภาพหลักเห็นภายใน viewport แรก และไม่มีข้อความทับกัน

- [ ] **Step 4: จับและตรวจ Mobile screenshot**

Run: `npx playwright screenshot --viewport-size="390,844" --full-page http://127.0.0.1:3000 artifacts/landing-mobile-390.png`

ตรวจ Thai wrapping, image crop, CTA width, Briefing Plate และไม่มี horizontal overflow

- [ ] **Step 5: ถ้า Visual QA พบปัญหา ให้เพิ่ม failing assertion ก่อนแก้**

เพิ่ม assertion ที่เจาะจงใน `home-page.e2e.ts` เช่น bounding box, visibility หรือ overflow รันให้ fail จากสาเหตุที่เห็น แล้วแก้เฉพาะ CSS ที่เกี่ยวข้องและรัน focused E2E ซ้ำจน pass

- [ ] **Step 6: ตรวจ diff และสถานะ worktree**

Run: `git diff --check`

Expected: no whitespace errors

Run: `git status --short`

Expected: clean หลัง commit งานทั้งหมด
