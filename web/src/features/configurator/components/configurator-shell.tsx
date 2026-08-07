"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";
import { HouseConfigurationSchema, type HouseConfiguration } from "../domain/configuration";
import { createConfiguratorStore } from "../state/configurator-store";
import { createDraftStorage, type DraftStorage } from "../state/draft-storage";
import { FunctionsStep } from "./functions-step";
import { MaterialFeaturesStep } from "./material-features-step";
import { ReviewStep } from "./review-step";
import { SiteBudgetStep } from "./site-budget-step";
import { StyleStep } from "./style-step";
import styles from "./configurator-shell.module.css";

export const CONFIGURATOR_STEPS = [
  { id: "style", label: "สไตล์บ้าน" },
  { id: "functions", label: "พื้นที่และฟังก์ชัน" },
  { id: "site-budget", label: "ทำเลและงบประมาณ" },
  { id: "materials", label: "วัสดุและส่วนพิเศษ" },
  { id: "review", label: "ตรวจทาน" },
] as const;

const StyleStepSchema = z.object({ styleId: z.string().nullable() }).refine((value) => value.styleId !== null, {
  message: "โปรดเลือกสไตล์บ้านก่อนดำเนินการต่อ",
  path: ["styleId"],
});

const FunctionsStepSchema = z.object({ residents: z.number().int().min(1).max(20), floors: z.number().int().min(1).max(3), bedrooms: z.number().int().min(1).max(12), bathrooms: z.number().int().min(1).max(15), parkingSpaces: z.number().int().min(0).max(10), functions: z.object({ office: z.boolean(), elderlyRoom: z.boolean(), thaiKitchen: z.boolean(), multipurposeRoom: z.boolean() }) });

const SiteBudgetStepSchema = z.object({ provinceCode: z.string().nullable() }).refine(
  (value) => value.provinceCode !== null,
  { message: "โปรดเลือกจังหวัดก่อนดำเนินการต่อ", path: ["provinceCode"] },
);

const MaterialsStepSchema = z.object({ materialLevel: z.enum(["select", "premium", "signature"]), specialFeatures: z.array(z.string()) });
const CompletionSchema = HouseConfigurationSchema.superRefine((value, context) => {
  if (value.styleId === null) context.addIssue({ code: "custom", path: ["styleId"], message: "ต้องเลือกสไตล์บ้าน" });
  if (value.provinceCode === null) context.addIssue({ code: "custom", path: ["provinceCode"], message: "ต้องเลือกจังหวัด" });
});

const STEP_HEADINGS = [
  "เลือกสไตล์บ้าน",
  "พื้นที่และฟังก์ชัน",
  "ทำเลและงบประมาณ",
  "วัสดุและส่วนพิเศษ",
  "ตรวจทานความต้องการ",
] as const;

type ConfiguratorShellProps = {
  onPreview?: (href: "/preview") => void;
  store?: ReturnType<typeof createConfiguratorStore>;
};

function createUnavailableDraftStorage(): DraftStorage {
  return {
    load: () => ({ status: "unavailable", operation: "read" }),
    save: () => ({ status: "unavailable", operation: "write" }),
    clear: () => ({ status: "unavailable", operation: "clear" }),
  };
}

function createBrowserConfiguratorStore() {
  if (typeof window === "undefined") return createConfiguratorStore(createUnavailableDraftStorage());
  try {
    return createConfiguratorStore(createDraftStorage(window.localStorage));
  } catch {
    return createConfiguratorStore(createUnavailableDraftStorage());
  }
}

function validationForStep(configuration: HouseConfiguration, step: number) {
  if (step === 0) return StyleStepSchema.safeParse({ styleId: configuration.styleId });
  if (step === 1) {
    return FunctionsStepSchema.safeParse({
      residents: configuration.residents,
      floors: configuration.floors,
      bedrooms: configuration.bedrooms,
      bathrooms: configuration.bathrooms,
      parkingSpaces: configuration.parkingSpaces,
      functions: configuration.functions,
    });
  }
  if (step === 2) return SiteBudgetStepSchema.safeParse({ provinceCode: configuration.provinceCode });
  if (step === 3) {
    return MaterialsStepSchema.safeParse({
      materialLevel: configuration.materialLevel,
      specialFeatures: configuration.specialFeatures,
    });
  }
  return z.object({}).safeParse({});
}

function stepError(step: number, valid: boolean) {
  if (valid) return undefined;
  if (step === 0) return "โปรดเลือกสไตล์บ้านก่อนดำเนินการต่อ";
  if (step === 2) return "โปรดเลือกจังหวัดก่อนดำเนินการต่อ";
  return "โปรดตรวจสอบข้อมูลในขั้นตอนนี้";
}

export function ConfiguratorShell({ onPreview, store: injectedStore }: ConfiguratorShellProps) {
  const [browserStore] = useState(createBrowserConfiguratorStore);
  const store = injectedStore ?? browserStore;
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getInitialState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isValid = validationForStep(state.configuration, state.currentStep).success;
  const error = stepError(state.currentStep, isValid);
  const errorId = state.currentStep === 0 ? "style-error" : "province-error";
  const concept = CONCEPT_CATALOG.find((item) => item.id === state.configuration.styleId) ?? CONCEPT_CATALOG[0];
  const area = calculateArea(state.configuration);

  useEffect(() => {
    headingRef.current?.focus();
  }, [state.currentStep]);

  useEffect(() => {
    const flush = () => store.getState().flushPendingDraft();
    window.addEventListener("pagehide", flush);
    return () => { window.removeEventListener("pagehide", flush); flush(); store.getState().dispose(); };
  }, [store]);

  const updateConfiguration = (patch: Partial<HouseConfiguration>) => state.updateConfiguration(patch);
  const moveNext = () => {
    if (!isValid) return;
    if (state.currentStep < CONFIGURATOR_STEPS.length - 1) state.setCurrentStep(state.currentStep + 1);
  };
  const moveBack = () => {
    if (state.currentStep > 0) state.setCurrentStep(state.currentStep - 1);
  };
  const openPreview = () => {
    if (CompletionSchema.safeParse(state.configuration).success) { onPreview?.("/preview"); return; }
    const firstInvalidStep = state.configuration.styleId === null ? 0 : state.configuration.provinceCode === null ? 2 : 0;
    state.setCurrentStep(firstInvalidStep);
  };

  return (
    <main className={styles.page} data-responsive-layout="split-preview" data-testid="configurator-layout">
      <header className={styles.masthead}>
        <p>KSB ARCHITECT / PRIVATE BRIEF</p>
        <ProgressStepper currentStep={state.currentStep} steps={CONFIGURATOR_STEPS} />
      </header>
      <div className={styles.shell}>
        <aside aria-label="ภาพตัวอย่างบ้าน" className={styles.preview}>
          <div className={styles.imageFrame}>
            <Image alt={`ภาพตัวอย่าง ${concept.label}`} fill preload sizes="(max-width: 899px) 100vw, 50vw" src={concept.image} />
          </div>
          <div className={styles.previewCopy} aria-live="polite">
            <p>CONCEPT PREVIEW</p>
            <h2>{concept.label}</h2>
            <span>พื้นที่ใช้สอย {area.usableAreaM2.toLocaleString("th-TH")} ตร.ม. {state.configuration.usableAreaOverrideM2 ? "(กำหนดเอง)" : "(แนะนำ)"}</span>
            <span>พื้นที่แนะนำ {area.recommendedUsableAreaM2.toLocaleString("th-TH")} ตร.ม. · CFA {area.constructionFloorAreaM2.toLocaleString("th-TH")} ตร.ม.</span>
          </div>
        </aside>
        <section aria-labelledby="step-heading" className={styles.formPanel}>
          <p className={styles.eyebrow}>ขั้นตอน {state.currentStep + 1} / {CONFIGURATOR_STEPS.length}</p>
          <h1 id="step-heading" ref={headingRef} tabIndex={-1}>{STEP_HEADINGS[state.currentStep]}</h1>
          <p className={styles.intro}>ให้ข้อมูลเท่าที่สะดวก เพื่อจัดกรอบความต้องการเบื้องต้นก่อนคุยกับสถาปนิก</p>
          <div className={styles.stepContent}>
            {state.currentStep === 0 ? <StyleStep error={error} errorId={errorId} onChange={(styleId) => updateConfiguration({ styleId })} selectedStyleId={state.configuration.styleId} /> : null}
            {state.currentStep === 1 ? <FunctionsStep configuration={state.configuration} onChange={updateConfiguration} /> : null}
            {state.currentStep === 2 ? <SiteBudgetStep configuration={state.configuration} error={error} errorId={errorId} onChange={updateConfiguration} /> : null}
            {state.currentStep === 3 ? <MaterialFeaturesStep configuration={state.configuration} onChange={updateConfiguration} /> : null}
            {state.currentStep === 4 ? <ReviewStep configuration={state.configuration} onEdit={(step) => state.setCurrentStep(step)} /> : null}
          </div>
          <div className={styles.actions}>
            {state.currentStep > 0 ? <Button onClick={moveBack} variant="ghost">ย้อนกลับ</Button> : <span />}
            {state.currentStep === CONFIGURATOR_STEPS.length - 1 ? (
              <Button onClick={openPreview}>ดู Preview</Button>
            ) : (
              <Button disabled={!isValid} onClick={moveNext}>ถัดไป</Button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
