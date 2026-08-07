# Smart Home Design Configurator — Codex Project Blueprint

> **Document purpose:** เอกสารหลักสำหรับวางแผน ออกแบบ พัฒนา ทดสอบ และขยายระบบ Smart Home Design Configurator โดยตั้งใจให้ใช้เป็น Project Context สำหรับ Codex และใช้แตกงานต่อเป็น Issue, Task, Skill Workflow, Pull Request และ QA Checklist ได้
>
> **Recommended file role:** เก็บไฟล์นี้ไว้ที่ root repository เช่น `SMART_HOME_CONFIGURATOR.md` และให้ Codex อ่านร่วมกับ `AGENTS.md`, `README.md`, `SECURITY.md` และเอกสาร Repository อื่นก่อนเริ่มงาน
>
> **Document status:** Planning baseline / Living document  
> **Primary language:** Thai  
> **Technical terms / code / file names:** English where clearer

---

# 0. Codex Operating Instructions

Codex ต้องปฏิบัติตามหลักต่อไปนี้ก่อนเริ่มงานสำคัญ:

1. อ่าน `AGENTS.md`, `README.md`, package scripts, repository structure และไฟล์คำสั่งที่เกี่ยวข้องก่อนแก้โค้ด
2. ตรวจสอบ Existing Stack และ Existing Conventions ก่อนเสนอการเปลี่ยน Architecture
3. ถ้า Repository มี Stack อยู่แล้ว ให้รักษา Stack เดิมเป็นค่าเริ่มต้น เว้นแต่มีเหตุผลเชิงเทคนิคที่ชัดเจนว่าควรเปลี่ยน
4. งานขนาดใหญ่ต้องเริ่มด้วย Inspection + Implementation Plan
5. แบ่งงานเป็น Scope ที่ Review ได้ และหลีกเลี่ยงการแก้ไฟล์ที่ไม่เกี่ยวข้อง
6. ห้ามสร้าง Business Fact, Testimonial, Award, Certification, Project Count, Client Logo หรือ Performance Claim ขึ้นเอง
7. ห้ามฝัง API Key, Secret, Service Role Key หรือ Credential ลง Client Code
8. ทุกงานที่แก้โค้ดต้องพยายามรัน Verification ที่ Repository รองรับ
9. ต้องรายงานผลทดสอบตามสถานะจริง: `Passed`, `Failed`, `Not available`, `Not run`, `Requires manual verification`
10. ก่อนจบงานให้ตรวจ Final Diff, Changed Files, Remaining Risks และ Next Action

## Recommended Codex Task Format

```text
Title:
Objective:
Context:
User story:
Acceptance criteria:
Constraints:
Files or areas likely affected:
Required verification:
Out of scope:
```

---

# 1. Project Summary

## Project Name

**Smart Home Design Configurator**

## Product Type

Interactive Web Application สำหรับช่วยลูกค้าที่กำลังวางแผนสร้างบ้าน สรุปความต้องการเบื้องต้นผ่าน Step-by-step Configurator และเปลี่ยนข้อมูลเหล่านั้นให้เป็น Brief ที่สถาปนิกสามารถนำไปใช้ต่อได้

## Core Product Idea

ผู้ใช้ไม่ควรต้องเริ่มต้นจากแบบฟอร์มติดต่อเปล่า ๆ

ระบบควรช่วยให้ผู้ใช้:

1. เลือกสไตล์บ้าน
2. ระบุขนาดและฟังก์ชัน
3. ระบุที่ดินและพื้นที่ก่อสร้าง
4. เลือก Mood, Color และ Material Level
5. ระบุช่วงงบประมาณ
6. เห็น Concept Preview และ Estimated Budget Range
7. ตรวจสอบ Summary
8. ส่ง Brief เพื่อขอคำปรึกษาจากสถาปนิก

## Product Positioning

ระบบนี้เป็น **Pre-consultation Design Configurator** ไม่ใช่ระบบออกแบบสถาปัตยกรรมอัตโนมัติ และไม่ใช่เครื่องมือสร้าง Construction Drawing

### System must communicate clearly

- ผลลัพธ์เป็น Concept / Preliminary Estimate
- ไม่ใช่แบบก่อสร้าง
- ไม่ใช่ BOQ
- ไม่ใช่ใบเสนอราคาสุดท้าย
- ราคาจริงขึ้นกับแบบ รายละเอียดวัสดุ สภาพที่ดิน พื้นที่ก่อสร้าง และ Scope งาน
- ผลลัพธ์ควรใช้เพื่อเริ่มต้นการสนทนากับสถาปนิกได้ง่ายขึ้น

---

# 2. Business Objective

## Primary Business Objective

เพิ่มจำนวน **Qualified Leads** หรือผู้มุ่งหวังที่มีข้อมูลความต้องการเพียงพอให้ทีมสามารถประเมินและติดตามต่อได้อย่างมีประสิทธิภาพ

## Primary Conversion

**Submit Design Brief / Request Architect Consultation**

ผู้ใช้กรอก Configurator จบและยินยอมส่งข้อมูลให้ทีมติดต่อกลับ

## Secondary Conversions

- Start Configurator
- Complete Configurator
- Save Draft
- Download Summary
- Share Configuration
- Request Budget Review
- Book Consultation
- Contact via approved channel
- View Related Projects / Portfolio

## Non-goals

ระบบเวอร์ชันแรกไม่ควรพยายาม:

- สร้างแบบสถาปัตยกรรมที่พร้อมก่อสร้าง
- คำนวณราคาก่อสร้างเป็นราคาผูกพันทางกฎหมาย
- สร้าง Structural Design
- ทำ BIM Authoring
- ทำ Automatic Building Code Approval
- แทนที่สถาปนิก
- สร้าง AI Rendering แบบไม่จำกัดก่อนพิสูจน์ว่าผู้ใช้ต้องการฟีเจอร์นี้จริง

---

# 3. Success Metrics

## Funnel Metrics

| Metric | Definition | Initial Target |
|---|---|---|
| Configurator Start Rate | ผู้เข้า Landing Page ที่เริ่ม Configurator | Establish baseline first |
| Step Completion Rate | ผู้ใช้ที่ผ่านแต่ละ Step | Establish baseline first |
| Full Completion Rate | ผู้เริ่มที่ไปถึง Summary | Establish baseline first |
| Lead Conversion Rate | ผู้เริ่ม Configurator ที่ Submit Lead | Establish baseline first |
| Qualified Lead Rate | Lead ที่ทีมประเมินว่าเหมาะสม | Requires CRM definition |
| Drop-off by Step | จุดที่ผู้ใช้ออกจาก Flow | Track every step |
| Time to Complete | เวลาตั้งแต่ Start ถึง Summary | Monitor median |
| Save/Resume Rate | ผู้ใช้ที่กลับมาทำต่อ | Phase-dependent |

> ห้ามกำหนดตัวเลข Conversion Improvement โดยไม่มี Baseline จริง

## Quality Metrics

- Form validation error rate
- API failure rate
- Lead duplicate rate
- Pricing-rule error rate
- Accessibility violations
- Build/test pass rate
- Core Web Vitals
- Mobile task completion
- Support requests caused by confusing estimates

---

# 4. Target Audience

## Primary Audience

บุคคลหรือครอบครัวที่กำลังพิจารณาสร้างบ้านใหม่และยังอยู่ในช่วงเก็บ Requirement, เปรียบเทียบแนวทาง, ประเมินงบประมาณ หรือเตรียมข้อมูลก่อนคุยกับสถาปนิก

## Common User Situations

- มีที่ดินแล้ว แต่ยังไม่มีแบบ
- มีภาพ Reference แต่ยังอธิบาย Requirement ไม่เป็นระบบ
- ต้องการทราบว่าช่วงงบที่มีสัมพันธ์กับขนาดบ้านอย่างไร
- สมาชิกครอบครัวมี Requirement หลายคน
- กำลังเปรียบเทียบบริษัทออกแบบ
- ยังไม่พร้อมคุยกับ Sales แต่พร้อมสำรวจตัวเลือกด้วยตัวเอง

## User Pains

- ไม่รู้ว่าควรเริ่มต้นจากอะไร
- ไม่เข้าใจศัพท์สถาปัตยกรรม
- ไม่แน่ใจว่าพื้นที่ใช้สอยควรเท่าไร
- กลัวงบบาน
- กลัวข้อมูลที่กรอกจะถูกนำไปขายหรือโทรรบกวน
- กลัว Preview ไม่ตรงกับบ้านจริง
- ตัวเลือกเยอะเกินไปและตัดสินใจยาก

## User Motivations

- อยากเห็นภาพเร็ว
- อยากมีกรอบงบประมาณ
- อยากเตรียมข้อมูลก่อนคุยกับผู้เชี่ยวชาญ
- อยากแชร์ให้ครอบครัวดู
- อยากรู้ว่าสไตล์บ้านที่ชอบเรียกว่าอะไร
- อยากลดเวลาคุย Requirement ซ้ำ

---

# 5. Jobs To Be Done

## Primary JTBD

> เมื่อฉันเริ่มคิดจะสร้างบ้าน ฉันต้องการเครื่องมือที่ช่วยจัดความต้องการของฉันให้เป็นระบบและเห็นภาพเบื้องต้น เพื่อให้ฉันตัดสินใจและคุยกับสถาปนิกได้มั่นใจขึ้น

## Supporting Jobs

- ช่วยแปลความต้องการทั่วไปให้กลายเป็น Architecture Brief
- ช่วยเตือนข้อมูลสำคัญที่ผู้ใช้มักลืม
- ช่วยตรวจความสมเหตุสมผลเบื้องต้นระหว่างพื้นที่ ฟังก์ชัน และงบ
- ช่วยลดความกลัวก่อนติดต่อบริษัท
- ช่วยให้ทีมรับ Lead ที่มี Context มากกว่าฟอร์มติดต่อทั่วไป

---

# 6. Product Principles

1. **Simple before impressive** — ความเข้าใจง่ายสำคัญกว่า Visual Effect
2. **Guide, do not overwhelm** — แนะนำทีละขั้น ไม่แสดงตัวเลือกทุกอย่างพร้อมกัน
3. **Estimate, do not overpromise** — ราคาต้องสื่อว่าเป็นช่วงประมาณการ
4. **Mobile-first interaction** — Flow ต้องทำจบได้บนมือถือ
5. **Progressive disclosure** — แสดงตัวเลือกขั้นสูงเมื่อจำเป็น
6. **Trust before lead capture** — อธิบายคุณค่าก่อนขอข้อมูลส่วนบุคคล
7. **No fake precision** — ห้ามแสดงตัวเลขที่ดูแม่นเกินข้อมูลที่มี
8. **Accessible by default** — Keyboard, Focus, Screen Reader และ Reduced Motion ต้องถูกคิดตั้งแต่ต้น
9. **Analytics-ready** — ทุก Step สำคัญต้องวัดได้
10. **Architecture-ready** — MVP ต้องขยายสู่ 3D, AI Recommendation หรือ CRM Integration ได้โดยไม่รื้อ Core Domain Model

---

# 7. Recommended Scope

## Phase 1 — Production-minded MVP

### Must Have

- Landing / Entry Page
- TH / EN language support
- 5–6 step configurator
- Progress indicator
- Back / Next navigation
- Save draft locally
- Resume draft
- House style selection
- Floors / bedrooms / bathrooms / parking
- Usable area selection
- Budget range
- Material tier
- Exterior color palette
- Basic land information
- Real-time summary
- Estimated budget range
- Concept preview using curated images / compositions
- Lead submission
- Consent / privacy acknowledgment
- Validation and useful error states
- Success state
- Analytics events
- Responsive mobile/tablet/desktop
- Accessibility baseline WCAG 2.2 AA
- Server-side input validation
- Rate limiting / abuse mitigation for public lead endpoint
- Error logging / observability baseline

### Should Have

- Shareable configuration ID or link
- Download summary as PDF
- Optional image/reference upload
- Related project recommendations
- Lead source / UTM capture
- Admin-viewable configuration summary
- Pricing rule version stored with submission

### Nice to Have

- Appointment booking
- CRM sync
- Google Sheets sync
- Email confirmation
- LINE integration
- Saved projects with account

## Phase 2 — Enhanced Visualization

- Configurable exterior facade preview
- Layer-based image compositing
- More material options
- Room/function recommendations
- Better pricing rules
- Comparison between configurations
- Share with family
- Server-side saved drafts

## Phase 3 — 3D Configurator

- Optimized GLTF model
- Material swapping
- Camera presets
- Exterior color/material updates
- Mobile quality tiers
- Graceful fallback
- Optional AR exploration if validated

## Phase 4 — AI-assisted Design Brief

- Requirement summarization
- Recommendation engine
- Conflict detection
- Missing-information prompts
- Suggested style based on references
- Architect-facing brief generation

> AI-generated architecture must remain advisory. Do not present AI output as licensed architectural approval or construction-ready design.

---

# 8. Recommended User Flow

```text
Landing
  ↓
Start Configurator
  ↓
Step 1 — Project & House Style
  ↓
Step 2 — Household & Functions
  ↓
Step 3 — Size & Land
  ↓
Step 4 — Materials & Look
  ↓
Step 5 — Budget & Priorities
  ↓
Review / Summary
  ↓
Contact & Consent
  ↓
Success
  ↓
Download / Share / Book Consultation
```

## Exit / Recovery Paths

- Save draft
- Reset configuration
- Return to previous step without data loss
- Recover after refresh
- Handle failed network submission
- Avoid duplicate lead submission after retry

---

# 9. Configurator Step Specification

## Step 1 — Project & House Style

### User Question

“บ้านแบบไหนใกล้เคียงสิ่งที่คุณต้องการ?”

### Fields

- Project type
  - New house
  - Renovation
  - Extension
  - Not sure
- Style
  - Modern
  - Minimal
  - Modern Luxury
  - Tropical
  - Contemporary
  - Nordic
  - Japanese-inspired
  - Other / Not sure

### UX Requirements

- Use visual cards with image + short explanation
- Do not require users to know architecture terminology
- Allow “Not sure”
- Avoid forcing a style before user can continue

---

## Step 2 — Household & Functions

### Fields

- Number of residents
- Floors
- Bedrooms
- Bathrooms
- Parking
- Kitchen preference
- Work room
- Elderly room
- Multi-purpose room
- Storage
- Pet consideration
- Other special requirements

### UX Requirements

- Use counters / segmented controls where appropriate
- Touch targets minimum accessible size
- Explain non-obvious options
- Avoid dozens of toggles on one screen

---

## Step 3 — Size & Land

### Fields

- Target usable area
- Land width
- Land depth
- Land unit
- Province / construction area
- Main road access
- Front-facing direction — optional
- Existing building — optional

### Rules

- Land dimensions can be optional in MVP
- Province can be required only if it materially affects pricing or service area
- Do not imply legal site feasibility from raw dimensions alone

---

## Step 4 — Materials & Visual Direction

### Fields

- Material tier
  - Standard
  - Premium
  - Luxury
- Exterior palette
- Roof character
- Window/door character
- Preferred materials
- Reference image upload — optional

### UX Requirements

- Use limited curated choices
- Explain price/maintenance implications where evidence exists
- Do not imply exact brands unless actual catalog integration exists

---

## Step 5 — Budget & Priorities

### Fields

- Budget range
- Target timeline
- Priority ranking:
  - Space
  - Design
  - Material quality
  - Energy efficiency
  - Maintenance
  - Budget control
- Notes

### Recommended Budget Input

Use ranges instead of false-precision single-value input.

Example ranges must be configurable from admin/config, not hardcoded throughout UI.

---

## Review / Summary

Must display:

- House style
- Project type
- Number of floors
- Bedrooms
- Bathrooms
- Parking
- Usable area
- Land summary
- Material level
- Palette
- Budget range
- Estimated cost range
- Priorities
- Notes
- Preview image
- Disclaimer
- Edit links per section

---

## Contact & Consent

### Minimum Contact Fields

- Name
- Preferred contact method
- Phone or email depending on selected contact method
- Province if not already supplied
- Optional LINE ID if supported
- Consent checkbox
- Privacy notice link

### Rules

- Do not ask for unnecessary sensitive data
- Do not require upload of land title in MVP
- If document upload is added later, design separate consent/storage/retention rules

---

# 10. Pricing Estimation Model

## Goal

ให้ระบบแสดง **Estimated Range** ที่อธิบายได้และ Version Control ได้

## Core Formula Concept

```text
base_estimate =
  usable_area_m2
  × base_cost_per_m2
  × material_multiplier
  × complexity_multiplier
  × location_multiplier

adjusted_estimate =
  base_estimate
  + optional_feature_adjustments

display_range =
  adjusted_estimate ± uncertainty_margin
```

## Pricing Rule Inputs

- Usable area
- Number of floors
- Material tier
- Roof complexity
- Facade complexity
- Optional functions
- Construction location
- Site condition if known
- Pricing rule version

## Required Properties

- Pricing rules must be stored in a central configuration
- Rules must be unit-testable
- Submission stores the pricing version used
- Avoid calculating authoritative pricing only on client
- Server re-validates pricing inputs
- UI must show disclaimer
- Team must be able to update pricing inputs without editing many components

## Pricing Disclaimer

Use professional wording equivalent to:

> ราคาที่แสดงเป็นการประเมินเบื้องต้นเพื่อช่วยวางกรอบโครงการ ไม่ใช่ใบเสนอราคา ราคาจริงต้องพิจารณาแบบ รายละเอียดวัสดุ สภาพที่ดิน พื้นที่ก่อสร้าง และขอบเขตงานเพิ่มเติม

---

# 11. Preview Strategy

## MVP Recommendation

Use **curated image preview + configurable overlays / mapped variants** rather than full procedural 3D.

### Why

- Faster
- Better art direction
- Better mobile performance
- Easier to control brand quality
- Easier to test conversion
- Lower implementation risk

## Preview Mapping Example

```text
style + floors + palette + material_tier → preview_asset_id
```

When exact combination does not exist:

1. Select nearest valid preview
2. Label as “Concept Preview”
3. Never claim it is the exact generated house

## 3D Upgrade Gate

Do not begin 3D production until at least one of the following is true:

- Analytics shows users engage with Preview strongly
- User research confirms desire to rotate/customize the model
- Sales team confirms preview materially improves lead quality
- Business accepts additional asset-production and QA cost

---

# 12. Information Architecture

## Public Routes

```text
/
├── /configurator
├── /configurator/review
├── /configurator/success
├── /projects
├── /projects/[slug]
├── /about
├── /contact
├── /privacy
├── /terms
└── /faq
```

Routes may be reduced if this is embedded into an existing website.

## Optional Internal/Admin Routes

```text
/admin
├── /leads
├── /leads/[id]
├── /pricing
├── /assets
└── /analytics
```

Do not build an admin dashboard in MVP unless there is a clear owner and workflow.

---

# 13. Recommended Technology Architecture

## Default Recommendation for New Production Repository

> If repository already exists, inspect and preserve its conventions first.

### Frontend

- Next.js — current stable version at implementation time
- TypeScript with strict mode
- React
- CSS Modules or Tailwind CSS based on team preference
- Server Components where suitable
- Client Components only for interactive areas
- Accessible component primitives when justified

### Backend

- Next.js server routes / server actions where suitable
- PostgreSQL-backed service such as Supabase for production data
- Server-side validation
- Object storage for future reference image uploads
- Separate server credentials from browser credentials

### Form / Validation

- Shared schema validation
- Client validation for UX
- Server validation as source of truth

### Analytics

Vendor-agnostic event layer first.

Possible downstream tools:
- GA4
- GTM
- PostHog
- Other approved analytics stack

### Observability

- Structured error logging
- API failure monitoring
- Submission failure tracking
- No personal data in logs unless explicitly approved and protected

### Optional Integrations

- CRM
- Google Sheets
- Email service
- Calendar
- LINE or other approved contact platform

## Google Sheets Policy

Google Sheets may be used as:

- Reporting mirror
- Lightweight operational export
- Temporary MVP integration

Google Sheets should **not** be the only source of truth for production-critical lead/configuration data if reliability, permissions, auditability, concurrency or future scaling matter.

---

# 14. Suggested Repository Structure

```text
src/
├── app/
│   ├── (marketing)/
│   ├── configurator/
│   ├── api/
│   └── ...
├── components/
│   ├── ui/
│   ├── configurator/
│   ├── marketing/
│   └── shared/
├── features/
│   └── configurator/
│       ├── components/
│       ├── domain/
│       ├── pricing/
│       ├── validation/
│       ├── analytics/
│       └── services/
├── lib/
├── config/
├── types/
└── styles/

tests/
├── unit/
├── integration/
└── e2e/

public/
└── images/
    └── configurator/

docs/
├── architecture/
├── product/
├── qa/
└── security/
```

Adapt to existing repository conventions rather than forcing this structure.

---

# 15. Domain Model

## Configuration

```ts
type HouseConfiguration = {
  id: string;
  version: number;
  locale: "th" | "en";

  projectType: string;
  style: string | null;

  residents?: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;

  usableAreaM2: number;

  land?: {
    width?: number;
    depth?: number;
    unit?: "m";
    province?: string;
    orientation?: string;
  };

  materials: {
    tier: "standard" | "premium" | "luxury";
    exteriorPalette?: string;
    roofStyle?: string;
    preferences?: string[];
  };

  priorities: string[];
  budgetRange?: string;
  targetTimeline?: string;
  notes?: string;

  estimate?: {
    min: number;
    max: number;
    currency: "THB";
    pricingRuleVersion: string;
  };

  previewAssetId?: string;

  createdAt: string;
  updatedAt: string;
};
```

## Lead

```ts
type ConsultationLead = {
  id: string;
  configurationId: string;

  name: string;
  preferredContactMethod: string;
  phone?: string;
  email?: string;
  lineId?: string;

  consentVersion: string;
  consentedAt: string;

  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };

  status: "new" | "contacted" | "qualified" | "unqualified" | "converted";
  createdAt: string;
};
```

## Important Data Design Rules

- Configuration and Lead should be separable
- Avoid storing unnecessary PII in configuration
- Store consent version
- Store pricing rule version
- Use stable IDs
- Define retention policy before production
- Audit fields where admin writes exist

---

# 16. State Management

## Configurator State

State should support:

- Current step
- Completed steps
- Field values
- Validation status
- Dirty state
- Save timestamp
- Pricing result
- Preview result
- Locale
- Submission status

## Persistence Strategy

### MVP

Local browser storage for anonymous draft.

### Production Enhancement

Server-saved draft when user explicitly chooses Save / Share.

### Rules

- Persist only necessary data
- Do not store sensitive contact data in local storage by default
- Version stored draft format
- Gracefully migrate or invalidate incompatible drafts

---

# 17. Validation Rules

Validation must exist at two layers:

1. Client-side — immediate UX feedback
2. Server-side — authoritative validation

## Examples

- Floors must be within configured supported range
- Bedrooms / bathrooms cannot be negative
- Usable area must be reasonable and configurable
- Phone/email must follow selected contact method
- Consent required before lead submission
- Enum values must be allowlisted
- Notes must have length limits
- Upload types/sizes must be allowlisted when upload exists

Never trust client-calculated pricing or hidden form fields.

---

# 18. UI / Design Direction

## Recommended Direction

**Architectural Premium Minimal**

### Desired Feel

- Professional
- Calm
- Premium
- Credible
- Modern
- Clear
- Human
- Architectural

### Avoid

- Generic AI SaaS gradient
- Excessive glassmorphism
- Neon effects
- Excessive rounded cards
- Decorative 3D that slows task completion
- Fake blueprint complexity
- Tiny labels
- Low-contrast gray text
- Excessive animation between form steps

## Visual Principles

- Strong typography hierarchy
- Large, high-quality architecture imagery
- Neutral canvas
- Controlled accent color
- Architectural grid
- Precise spacing
- Meaningful dividers
- Clear focus state
- Responsive type scale
- Content width optimized for reading and forms

---

# 19. Design Tokens

Exact brand values remain TBD until brand assets are supplied.

## Token Categories

```text
color.canvas
color.surface
color.surfaceElevated
color.textPrimary
color.textSecondary
color.textMuted
color.border
color.brandPrimary
color.brandSecondary
color.accent
color.success
color.warning
color.error
color.focus
color.overlay

spacing.1 ... spacing.n
radius.sm / md / lg
shadow.subtle / elevated

font.display
font.body
font.mono
```

## Thai Typography Requirements

- Must render Thai naturally
- Test line-height with Thai vowel/diacritic marks
- Avoid clipped accents
- Do not use excessive letter-spacing with Thai
- Test font-weight availability
- Use production-licensed fonts

---

# 20. Component Inventory

## Core UI

- Button
- Link
- Input
- Textarea
- Select
- Radio group
- Checkbox
- Toggle
- Counter
- Segmented control
- Slider where truly useful
- Progress indicator
- Stepper
- Card
- Image choice card
- Tooltip
- Dialog
- Alert
- Toast / status message
- Skeleton / loading indicator
- Error state
- Empty state

## Configurator Components

- `ConfiguratorShell`
- `StepHeader`
- `StepNavigation`
- `HouseStyleSelector`
- `RoomCounterGroup`
- `AreaSelector`
- `LandForm`
- `MaterialTierSelector`
- `PaletteSelector`
- `BudgetRangeSelector`
- `PriorityRanker`
- `PreviewPanel`
- `PriceEstimate`
- `ConfigurationSummary`
- `LeadForm`
- `ConsentBlock`
- `SaveDraftAction`
- `ResetDialog`

Every interactive component must define:
- default
- hover
- focus
- active
- disabled
- loading
- error
- success states where relevant

---

# 21. Responsive Requirements

## Breakpoint Philosophy

Do not simply shrink desktop.

### Mobile

- Single-column primary flow
- Sticky bottom Next/Back action where appropriate
- Preview can collapse into summary card
- No horizontal overflow at 320–375 px range
- Avoid modal-heavy interaction
- Form fields work with mobile keyboard
- Large touch targets
- Preserve essential information

### Tablet

- One or two-column depending on step
- Preview may sit beside controls where space allows

### Desktop

- Two-column configurator recommended:
  - Left: controls
  - Right: live preview / summary
- Keep content readable on ultra-wide displays
- Avoid stretching form fields unnecessarily

---

# 22. Accessibility Requirements

Target **WCAG 2.2 Level AA**

Minimum:

- Semantic HTML
- Correct heading hierarchy
- Keyboard navigation
- Visible focus
- Form labels
- Field-level error association
- Error summary when multiple fields fail
- Status announcements for price/preview updates when appropriate
- Sufficient color contrast
- Alt text strategy
- Meaningful button/link labels
- Touch target sizing
- Dialog focus management
- Reduced motion support
- Content zoom to 200%
- Reflow
- Correct `lang`
- Accessible drag alternative if ranking uses drag-and-drop

Do not state “fully accessible” unless actual testing supports the claim.

---

# 23. Motion Principles

Motion should communicate state, not decorate.

Allowed examples:

- Step transition
- Progress change
- Preview crossfade
- Price estimate update
- Validation status
- Success confirmation

Requirements:

- Fast and subtle
- Avoid large parallax
- Respect `prefers-reduced-motion`
- Do not delay form completion
- Avoid animation that causes layout shift

---

# 24. Performance Targets

Default targets:

- LCP ≤ 2.5 s
- INP ≤ 200 ms
- CLS ≤ 0.1
- Minimal unnecessary JavaScript
- Responsive image sizes
- Lazy-load non-critical imagery
- Stable dimensions
- Font loading strategy
- Avoid shipping 3D libraries in MVP unless needed
- Avoid large animation libraries for trivial effects

## Performance Risk Areas

- High-resolution architecture images
- PDF generation
- Image upload
- 3D preview
- Analytics scripts
- Third-party chat widgets
- CRM scripts
- Excessive client-side state

Record measured values separately from targets.

---

# 25. SEO Requirements

For public marketing routes:

- Unique title
- Meta description
- Canonical
- Open Graph
- Structured heading hierarchy
- Crawlable text content
- XML sitemap if applicable
- Robots policy
- Structured data only where valid
- Image alt text
- Performance-conscious rendering

Configurator internal states do not need to become crawlable pages unless a deliberate SEO strategy exists.

---

# 26. Analytics Event Model

Use stable semantic event names.

## Funnel Events

```text
configurator_viewed
configurator_started
configurator_step_viewed
configurator_step_completed
configurator_step_back
configurator_validation_error
configurator_draft_saved
configurator_draft_resumed
configurator_summary_viewed
estimate_viewed
lead_form_viewed
lead_submitted
lead_submit_failed
configurator_completed
configuration_shared
summary_downloaded
consultation_booking_clicked
```

## Recommended Properties

- step_id
- locale
- project_type
- house_style
- material_tier
- area_bucket
- budget_bucket
- device_category
- traffic_source
- experiment_id where applicable

## Analytics Privacy Rule

Do not send raw phone numbers, emails, names, free-text notes or uploaded file content to analytics platforms.

---

# 27. Privacy / PDPA Planning

This is a product requirement, not a footer-only task.

## Minimum Requirements

- Explain purpose of collecting contact data
- Link to Privacy Notice
- Capture consent where required
- Store consent timestamp/version
- Define who can access leads
- Define retention period
- Define deletion process
- Protect export/download of lead data
- Do not expose contact data through public IDs
- Do not log PII unnecessarily

## Future Uploads

If user can upload land/title/reference documents:

- Define allowed file types
- File-size limit
- Malware scanning strategy
- Private storage
- Signed access URLs
- Retention/deletion policy
- Explicit user notice
- Access logging if necessary

Legal wording must be reviewed by a qualified legal/privacy owner before launch.

---

# 28. Security Model

## Assets to Protect

- Lead PII
- Configuration data
- Pricing rules
- Admin accounts
- Uploaded files
- CRM credentials
- Email/LINE integration credentials
- Database service credentials

## Trust Boundaries

- Public browser → application server
- Application server → database
- Application server → storage
- Application server → third-party CRM
- Application server → email/contact services
- Admin browser → admin backend

## Attacker-controlled Inputs

- Form fields
- Query strings
- UTM parameters
- Share IDs
- File uploads
- Locale
- API request bodies
- Headers
- Free-text notes

## Security Invariants

- Client cannot set trusted pricing result directly
- Public user cannot read another user’s private configuration unless sharing model explicitly allows it
- Lead PII cannot be exposed by guessing IDs
- Admin routes require authorization, not only authentication
- Secrets stay server-side
- Input is validated and constrained
- Error messages do not leak sensitive internals

---

# 29. Codex Security Skill Routing

When installed Codex Security skills are available, use them deliberately.

## Before Major Production Build

Use repository-level threat modeling when appropriate:

```text
$threat-model
```

Goal:
- Identify assets
- Trust boundaries
- Attacker-controlled input
- Security invariants
- Repository-wide failure modes

## Before Release

Use a repository security scan appropriate to project scope.

Recommended skill families when installed:

- `security-scan` — standard repository/path security audit
- `deep-security-scan` — exhaustive multi-pass scan when explicitly required
- `security-diff-scan` — security review of PR / commit / branch diff
- `validation` — validate plausible candidate findings
- `triage-finding` — triage imported findings
- `fix-finding` — fix and verify a selected validated finding
- `track-findings` — create issues/advisories for validated findings
- `define-security-policy` — create or refine `SECURITY.md`

Do not treat a threat model as a vulnerability scan.

---

# 30. GitHub / Delivery Skill Routing

If the project uses GitHub and relevant skills are installed:

- Use general `github` skill for repository / issue / PR orientation
- Use `gh-address-comments` for actionable review feedback
- Use `gh-fix-ci` for failing GitHub Actions checks
- Use `yeet` for intentional commit → push → draft PR workflow

Before publishing:
- Confirm changed scope
- Review diff
- Run tests/build
- Use meaningful commit
- Avoid bundling unrelated changes

---

# 31. Testing Strategy

## Unit Tests

Must cover at minimum:

- Pricing rules
- Estimate range
- Validation schemas
- Draft migration
- Preview mapping logic
- Analytics payload sanitization
- Utility conversions

## Integration Tests

- Configurator state across steps
- Server-side validation
- Estimate request
- Lead submission
- Duplicate prevention
- Failed submission recovery
- Consent storage
- Database writes

## E2E Tests

Core happy path:

```text
Open landing
→ Start
→ Complete all steps
→ Review summary
→ Submit contact
→ Success
```

Important alternative paths:

- Back navigation preserves values
- Refresh/resume draft
- Validation errors
- Network failure
- Duplicate submit
- Reset
- Thai / English
- Mobile viewport
- Keyboard-only flow

---

# 32. Manual QA Matrix

Minimum viewport set:

| Device Class | Example Width |
|---|---:|
| Small mobile | 320 px |
| Standard mobile | 375 px |
| Large mobile | 430 px |
| Tablet | 768 px |
| Laptop | 1280 px |
| Desktop | 1440 px |
| Large desktop | 1920 px |

Manual checks:

- No horizontal overflow
- Text does not clip
- Sticky action does not cover fields
- Keyboard does not break layout
- Focus order is logical
- Error messages are understandable
- Thai line breaks are natural
- Preview remains legible
- Form can be completed one-handed on mobile
- Screen zoom 200%
- Reduced motion
- Back/forward browser behavior where relevant

---

# 33. Error / Empty / Loading States

Must design intentionally.

## Loading

- Initial configuration
- Estimate update
- Lead submission
- Image upload if added
- Summary export

## Errors

- Invalid field
- Pricing unavailable
- Preview unavailable
- Network failure
- Server rejection
- Duplicate lead
- Session/draft conflict
- Upload failure

## Empty

- No preview available
- No related projects
- No saved draft
- Optional data omitted

Use useful user-facing recovery actions.

---

# 34. Content Requirements

## Tone

- Professional
- Clear
- Reassuring
- Non-pushy
- Human
- Credible

## Avoid

- “ออกแบบบ้านในฝันภายใน 1 นาที” unless provably true
- “ราคาที่แม่นยำที่สุด”
- “รับประกันราคานี้”
- “AI ออกแบบแทนสถาปนิก”
- Fake urgency
- Fake scarcity

## Required Copy Areas

- Hero value proposition
- How it works
- Step helper copy
- Estimate disclaimer
- Privacy / consent
- Error messages
- Success confirmation
- FAQ
- Contact expectation: what happens after submission

All Thai copy must be proofread before release.

---

# 35. Assumptions Register

Current assumptions that may change architecture:

1. This is a new product or can be developed as a distinct feature module.
2. Primary market is Thai-speaking users, with English support required.
3. Primary conversion is architect consultation request.
4. MVP does not require user accounts.
5. MVP does not require live 3D.
6. Price estimate is informational, not binding.
7. Production data should use a proper database rather than only Google Sheets.
8. Reference images and actual brand assets are not yet finalized.
9. No final CRM vendor has been specified.
10. No legal/privacy copy has been approved yet.
11. Company-specific service areas, price ranges and construction rules must be provided by business owner.
12. Actual target metrics should be established after baseline analytics.

If any assumption becomes false, update this document before implementing dependent features.

---

# 36. Open Decisions

These decisions should be resolved before full production rollout:

- Brand identity / font / color system
- Service area
- Actual supported house styles
- Pricing base rates
- Pricing multipliers
- Minimum/maximum supported area
- Contact SLA
- CRM destination
- Lead owner
- Google Sheets requirement
- Booking integration
- PDF requirement
- Share-link requirement
- Reference upload requirement
- Data retention policy
- Consent wording
- Hosting platform
- Database provider
- Analytics provider
- Error monitoring provider

Do not block early prototype work on choices that do not materially affect architecture.

---

# 37. Delivery Roadmap

## Milestone 0 — Repository & Product Setup

Deliver:
- Repository inspection
- `AGENTS.md`
- Project doc linked
- Architecture decision record
- Environment configuration pattern
- CI baseline

Exit criteria:
- Build runs
- Lint/typecheck configured
- Basic CI works

---

## Milestone 1 — UX Prototype

Deliver:
- Landing
- Configurator shell
- All steps
- Local state
- Summary
- Responsive UI
- Placeholder preview

Exit criteria:
- Complete flow without backend
- Mobile usable
- Keyboard navigation baseline

---

## Milestone 2 — Domain & Pricing

Deliver:
- Typed domain model
- Shared validation
- Pricing engine
- Config versioning
- Unit tests
- Price disclaimer

Exit criteria:
- Pricing deterministic
- Test coverage for rule boundaries
- No trusted price from client

---

## Milestone 3 — Persistence & Lead Capture

Deliver:
- Database schema
- Server APIs/actions
- Lead submission
- Consent record
- Duplicate protection
- Error recovery

Exit criteria:
- E2E happy path works
- Failed submission recoverable
- PII protected

---

## Milestone 4 — Analytics & Optimization Readiness

Deliver:
- Analytics event layer
- Funnel events
- UTM capture
- Error events
- Privacy-safe properties

Exit criteria:
- Events observable in test environment
- No PII leakage in analytics

---

## Milestone 5 — QA / Accessibility / Performance

Deliver:
- E2E coverage
- Accessibility checks
- Responsive QA
- Performance audit
- Security review
- Final bug fixes

Exit criteria:
- Release checklist complete
- Critical defects = 0
- Remaining limitations documented

---

## Milestone 6 — Launch & Learning

Deliver:
- Production release
- Dashboard/funnel baseline
- Support workflow
- Experiment backlog

Exit criteria:
- Baseline metrics collected
- First optimization hypothesis selected

---

# 38. Issue Breakdown Recommendation

Create one GitHub Issue per coherent scope.

Example:

```text
EPIC-01 Product shell and routing
EPIC-02 Configurator UX flow
EPIC-03 Domain model and validation
EPIC-04 Pricing engine
EPIC-05 Preview mapping
EPIC-06 Draft persistence
EPIC-07 Lead capture and consent
EPIC-08 Analytics
EPIC-09 Accessibility
EPIC-10 Performance
EPIC-11 Security hardening
EPIC-12 Production release QA
```

Each Epic should be decomposed into reviewable Tasks.

Avoid one PR that implements the entire product.

---

# 39. Definition of Done

A feature is not done merely because UI looks correct.

## Strategy

- User problem is clear
- Business objective is clear
- Conversion is clear

## UX

- Happy path works
- Back/recovery path works
- Errors are understandable
- Mobile behavior is intentional

## Design

- Uses approved tokens/components
- Thai text renders correctly
- No arbitrary one-off style unless justified

## Engineering

- Typed
- Validated
- No obvious duplication
- No dead debug code
- No secrets
- Repository conventions respected

## Verification

- Lint attempted
- Typecheck attempted
- Tests attempted
- Production build attempted
- Relevant manual QA documented

## Accessibility

- Keyboard path checked
- Focus visible
- Labels and errors accessible
- Reduced motion considered

## Handoff

- Changed files listed
- Tests/results listed
- Risks listed
- Next action listed

---

# 40. Release Checklist

```text
[ ] Business copy approved
[ ] Pricing rules approved
[ ] Pricing disclaimer approved
[ ] Privacy notice linked
[ ] Consent wording approved
[ ] Analytics validated
[ ] No PII in analytics
[ ] Lead destination validated
[ ] Duplicate submission handled
[ ] Error monitoring enabled
[ ] Secrets server-side
[ ] Production DB permissions reviewed
[ ] Admin authorization reviewed
[ ] Unit tests pass
[ ] Integration tests pass
[ ] E2E critical flow passes
[ ] Production build passes
[ ] Mobile QA complete
[ ] Keyboard QA complete
[ ] Accessibility scan performed
[ ] Performance measured
[ ] SEO metadata reviewed
[ ] 404 / 500 behavior reviewed
[ ] Backup / recovery expectations documented
[ ] Known limitations documented
[ ] Rollback plan understood
```

---

# 41. Experiment Backlog

After launch or working prototype, prioritize experiments based on evidence.

Potential experiments:

1. 5-step vs 3-step configurator
2. Show estimated budget continuously vs only at summary
3. Ask budget early vs late
4. Require phone vs allow email-first
5. Large visual style selection vs compact cards
6. Static preview vs interactive preview
7. “Talk to architect” CTA vs “Get project summary”
8. Save before contact vs contact before save
9. Social proof placement
10. Recommendation helper vs manual selection only

Each experiment must define:
- Question
- Hypothesis
- Primary metric
- Guardrail metric
- Audience
- Duration/sample requirement
- Implementation cost
- Decision rule

---

# 42. AI / Codex Experiment Mode

If this project is also used to compare AI coding workflows:

## Controlled Variables

- Same repository
- Same brief
- Same assets
- Same stack
- Same acceptance criteria
- Same test commands
- Same iteration limit
- Same reviewer rubric

## Suggested Rubric

| Category | Weight |
|---|---:|
| Business / strategic fit | 15% |
| IA / UX | 15% |
| Visual design | 15% |
| Brand distinctiveness | 10% |
| Responsive | 10% |
| Accessibility | 10% |
| Performance | 10% |
| Code quality | 5% |
| Functional completeness | 5% |
| Maintainability / handoff | 5% |

Do not select winner based on screenshot only.

---

# 43. Codex Start Command — Project Planning

Use this when the repository has been initialized:

```text
MODE: DISCOVER + DESIGN

Read:
- AGENTS.md
- README.md
- SMART_HOME_CONFIGURATOR.md
- package.json
- existing source structure
- existing design tokens
- existing tests

Do not edit code yet.

Tasks:
1. Audit the current repository against the project blueprint.
2. Identify mismatches, missing decisions and technical risks.
3. Confirm the actual stack and conventions.
4. Produce a proposed implementation architecture.
5. Break Milestone 1 into reviewable tasks.
6. Identify which installed skills should be used for design, GitHub, security, testing or review.
7. List material assumptions only.
8. Recommend the smallest coherent first task.
9. State files likely to be affected.
10. Define verification commands using repository-native scripts.

Output:
- Current state
- Gaps
- Recommended architecture
- Task breakdown
- Skill routing
- Verification plan
- Risks
- Recommended first task
```

---

# 44. Codex Start Command — Build MVP

```text
MODE: BUILD

Use SMART_HOME_CONFIGURATOR.md as the product and engineering source of truth.

Before editing:
1. Read AGENTS.md and repository instructions.
2. Inspect related files.
3. Confirm existing stack and test commands.
4. Write a concise implementation plan.

Objective:
Implement the next approved Smart Home Design Configurator task only.

Rules:
- Keep scope reviewable.
- Preserve existing architecture unless change is justified.
- Use shared types and validation.
- Do not hardcode business rules across multiple components.
- Do not trust client-side pricing.
- Do not invent business content.
- Do not add dependencies unless necessary.
- Respect accessibility and responsive requirements.
- Do not include unrelated refactors.

Verification:
- Run lint
- Run typecheck
- Run relevant unit/integration/E2E tests
- Run production build
- Inspect final diff
- Report failures honestly

Final report:
- Objective completed
- Changed files
- Verification results
- Risks / limitations
- Next recommended task
```

---

# 45. Codex Start Command — UX/UI Review

```text
MODE: REVIEW

Review the current Smart Home Design Configurator against SMART_HOME_CONFIGURATOR.md.

Evaluate:
- Business and conversion clarity
- User flow
- Information hierarchy
- Form usability
- Mobile behavior
- Thai typography
- Error/recovery states
- Accessibility
- Visual consistency
- Brand distinctiveness
- Performance implications

Classify:
- Critical
- High
- Medium
- Low

For each issue include:
1. Evidence
2. Why it matters
3. Recommended fix
4. Effort
5. Verification method

Do not modify code unless explicitly asked.
Finish with the five highest-impact fixes.
```

---

# 46. Codex Start Command — Security Review

```text
MODE: REVIEW

Perform a security review of the Smart Home Design Configurator repository.

Read:
- AGENTS.md
- SECURITY.md if present
- SMART_HOME_CONFIGURATOR.md
- authentication/authorization code
- public form endpoints
- pricing logic
- database access
- file upload code if present
- integrations
- environment configuration

Focus on:
- PII exposure
- insecure direct object reference
- missing authorization
- server-side validation
- rate limiting / abuse
- unsafe upload
- secret exposure
- log leakage
- injection
- XSS
- CSRF where applicable
- insecure redirects
- dependency risk
- client-trusted pricing

Use installed Codex Security skills when their trigger matches the task.
Do not claim a finding is valid without evidence.
Report severity, evidence, exploitability, impact and remediation.
```

---

# 47. Recommended Immediate Build Order

Do not start with database, CRM, 3D or AI.

Recommended first implementation sequence:

```text
1. Project shell
2. Design tokens
3. Configurator domain types
4. Step navigation/state
5. Step UI
6. Summary
7. Validation
8. Pricing engine
9. Persistence
10. Lead submission
11. Analytics
12. Accessibility / performance / security hardening
13. Production integration
14. 3D/AI only after evidence
```

This order intentionally reduces expensive rework.

---

# 48. Final Product Decision Rules

When trade-offs exist, prioritize:

1. Correctness
2. User comprehension
3. Business fit
4. Accessibility
5. Reliability
6. Maintainability
7. Performance
8. Visual refinement
9. Novelty

A simpler configurator that users complete successfully is better than a visually impressive 3D experience that is slow, confusing or unreliable.

---

# 49. Next Action

**Recommended next action: Milestone 0 — Repository & Product Setup**

Codex should:

1. Inspect or initialize the repository.
2. Create/verify `AGENTS.md`.
3. Add this document to repository root.
4. Confirm stack.
5. Create architecture decision notes.
6. Set up lint/typecheck/test/build commands.
7. Create the first GitHub Epic / Issue for **Configurator UX Shell**.
8. Do not implement 3D, pricing integration or CRM until the base flow is working and reviewable.

---

# Source & Governance Note

This blueprint is intentionally production-minded and should remain a living document.

When business rules change:
- update this file first or in the same reviewed change
- record material architecture decisions
- version pricing and consent logic
- avoid undocumented behavior

When implementation and this document conflict:
1. Inspect repository reality
2. Identify whether the document is stale or implementation is wrong
3. Do not silently choose one
4. Record the decision in the task / PR

