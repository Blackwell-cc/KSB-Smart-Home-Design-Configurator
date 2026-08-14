"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { QA_AREA_CATALOG } from "@/features/area-planning/domain/area-catalog";
import { HouseConfigurationSchema, type HouseConfiguration } from "../domain/configuration";
import { buildLivePreview } from "../presentation/live-preview";
import { createConfiguratorStore } from "../state/configurator-store";
import { createDraftStorage, type DraftStorage } from "../state/draft-storage";
import { ConfiguratorHeader } from "./configurator-header";
import { FunctionsStep } from "./functions-step";
import { MaterialFeaturesStep } from "./material-features-step";
import { MaterialsPreview } from "./materials-preview";
import { ReviewStep } from "./review-step";
import { SiteBudgetStep } from "./site-budget-step";
import { StylePreviewStage } from "./style-preview-stage";
import { StyleStep } from "./style-step";
import styles from "./configurator-shell.module.css";

export const CONFIGURATOR_STEPS = [
  { id: "style", label: "เลือกรูปแบบบ้าน" },
  { id: "functions", label: "พื้นที่และฟังก์ชัน" },
  { id: "site-budget", label: "กำหนดงบประมาณ" },
  { id: "materials", label: "วัสดุและส่วนพิเศษ" },
  { id: "review", label: "ตรวจสอบและสรุป" },
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

const CompletionSchema = HouseConfigurationSchema.superRefine((value, context) => {
  if (value.styleId === null) context.addIssue({ code: "custom", path: ["styleId"], message: "ต้องเลือกสไตล์บ้าน" });
  if (value.provinceCode === null) context.addIssue({ code: "custom", path: ["provinceCode"], message: "ต้องเลือกจังหวัด" });
});

const STEP_HEADINGS = [
  "เลือกรูปแบบบ้าน",
  "พื้นที่และฟังก์ชัน",
  "ทำเลและงบประมาณ",
  "วัสดุและส่วนพิเศษ",
  "ตรวจทานความต้องการ",
] as const;

type ConfiguratorShellProps = {
  onPreview?: (href: "/preview") => void;
  store?: ReturnType<typeof createConfiguratorStore>;
};

type BudgetDraft = { min: string; max: string };
type AreaDraft = string;

function budgetDraftFor(targetBudget: HouseConfiguration["targetBudget"]): BudgetDraft {
  return { min: targetBudget?.min.toString() ?? "", max: targetBudget?.max.toString() ?? "" };
}

function budgetErrorFor(budget: BudgetDraft): string | undefined {
  const hasMinimum = budget.min !== "";
  const hasMaximum = budget.max !== "";
  if (!hasMinimum && !hasMaximum) return undefined;
  if (!hasMinimum || !hasMaximum) return "กรอกงบประมาณทั้งสองช่อง หรือเว้นว่างทั้งคู่";
  const minimum = Number(budget.min);
  const maximum = Number(budget.max);
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum <= 0 || maximum <= 0) return "กรุณาระบุงบประมาณเป็นจำนวนบวก";
  if (minimum > maximum) return "งบประมาณสูงสุดต้องไม่น้อยกว่างบเริ่มต้น";
  return undefined;
}

function areaDraftFor(usableAreaOverrideM2: HouseConfiguration["usableAreaOverrideM2"]): AreaDraft {
  return usableAreaOverrideM2?.toString() ?? "";
}

function areaErrorFor(area: AreaDraft): string | undefined {
  if (area === "") return undefined;
  const value = Number(area);
  if (!Number.isFinite(value) || value < 60 || value > 1500) return "โปรดระบุพื้นที่ใช้สอยระหว่าง 60–1,500 ตร.ม.";
  return undefined;
}

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

const SERVER_CONFIGURATOR_SNAPSHOT = createConfiguratorStore(createUnavailableDraftStorage()).getInitialState();

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
  if (step === 3) return HouseConfigurationSchema.safeParse(configuration);
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
  const state = useSyncExternalStore(store.subscribe, store.getState, () => SERVER_CONFIGURATOR_SNAPSHOT);
  const [budgetDraftOverride, setBudgetDraft] = useState<BudgetDraft | null>(null);
  const [areaDraftOverride, setAreaDraft] = useState<AreaDraft | null>(null);
  const budgetDraft = budgetDraftOverride ?? budgetDraftFor(state.configuration.targetBudget);
  const areaDraft = areaDraftOverride ?? areaDraftFor(state.configuration.usableAreaOverrideM2);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasMountedStep = useRef(false);
  const stepSchemaValid = validationForStep(state.configuration, state.currentStep).success;
  const budgetError = budgetErrorFor(budgetDraft);
  const areaError = areaErrorFor(areaDraft);
  const isValid = stepSchemaValid && (state.currentStep !== 1 || areaError === undefined) && (state.currentStep !== 2 || budgetError === undefined);
  const error = stepError(state.currentStep, stepSchemaValid);
  const errorId = state.currentStep === 0 ? "style-error" : "province-error";
  const area = calculateArea(state.configuration, QA_AREA_CATALOG);
  const livePreview = buildLivePreview(state.configuration, area);

  useEffect(() => {
    if (!hasMountedStep.current) {
      hasMountedStep.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [state.currentStep]);

  useEffect(() => {
    const flush = () => store.getState().flushPendingDraft();
    window.addEventListener("pagehide", flush);
    return () => { window.removeEventListener("pagehide", flush); flush(); store.getState().dispose(); };
  }, [store]);

  const updateConfiguration = (patch: Partial<HouseConfiguration>) => state.updateConfiguration(patch);
  const updateBudget = (key: "min" | "max", value: string) => {
    const nextBudget = { ...budgetDraft, [key]: value };
    setBudgetDraft(nextBudget);
    const nextError = budgetErrorFor(nextBudget);
    if (nextError !== undefined || (nextBudget.min === "" && nextBudget.max === "")) {
      updateConfiguration({ targetBudget: null });
      return;
    }
    updateConfiguration({ targetBudget: { min: Number(nextBudget.min), max: Number(nextBudget.max) } });
  };
  const updateArea = (value: string) => {
    setAreaDraft(value);
    if (areaErrorFor(value) !== undefined) return;
    updateConfiguration({ usableAreaOverrideM2: value === "" ? null : Number(value) });
  };
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
  const navigationActions = state.currentStep > 0 ? <div className={styles.actions}>
    <Button onClick={moveBack} variant="ghost">ย้อนกลับ</Button>
    {state.currentStep === CONFIGURATOR_STEPS.length - 1 ? (
      <Button onClick={openPreview}>ดู Preview</Button>
    ) : (
      <Button disabled={!isValid} onClick={moveNext}>ถัดไป</Button>
    )}
  </div> : null;

  return (
    <main className={styles.page} data-responsive-layout="split-preview" data-step={CONFIGURATOR_STEPS[state.currentStep].id} data-testid="configurator-layout">
      <ConfiguratorHeader currentStep={state.currentStep} onSave={() => store.getState().flushPendingDraft()} steps={CONFIGURATOR_STEPS} />
      <div className={styles.shell} data-step={CONFIGURATOR_STEPS[state.currentStep].id}>
        <section aria-labelledby="step-heading" className={styles.formPanel} data-choice-canvas="true">
          <p className={styles.eyebrow}>ขั้นตอน {state.currentStep + 1} / {CONFIGURATOR_STEPS.length}</p>
          <h1 id="step-heading" ref={headingRef} tabIndex={-1}>{STEP_HEADINGS[state.currentStep]}</h1>
          <p className={styles.intro} id="configurator-help">{state.currentStep === 0 ? "เลือกสไตล์ที่ใช่ เพื่อเริ่มออกแบบบ้านในแบบของคุณ" : state.currentStep === 3 ? "เลือกวัสดุและรายละเอียดพิเศษ เพื่อกำหนดคุณภาพและกรอบงบประมาณให้สอดคล้องกับบ้านของคุณ" : "ให้ข้อมูลเท่าที่สะดวก เพื่อจัดกรอบความต้องการเบื้องต้นก่อนคุยกับสถาปนิก"}</p>
          <div className={styles.stepContent}>
            {state.currentStep === 0 ? <StyleStep error={error} errorId={errorId} onChange={(styleId) => updateConfiguration({ styleId })} selectedStyleId={state.configuration.styleId} /> : null}
            {state.currentStep === 1 ? <FunctionsStep areaDraft={areaDraft} areaError={areaError} configuration={state.configuration} onAreaChange={updateArea} onChange={updateConfiguration} /> : null}
            {state.currentStep === 2 ? <SiteBudgetStep budgetDraft={budgetDraft} budgetError={budgetError} configuration={state.configuration} error={error} errorId={errorId} onBudgetChange={updateBudget} onChange={updateConfiguration} /> : null}
            {state.currentStep === 3 ? <MaterialFeaturesStep configuration={state.configuration} onChange={updateConfiguration} /> : null}
            {state.currentStep === 4 ? <ReviewStep configuration={state.configuration} onEdit={(step) => state.setCurrentStep(step)} /> : null}
          </div>
          {state.currentStep === 3 ? null : navigationActions}
        </section>
        {state.currentStep === 0 ? (
          <StylePreviewStage
            configuration={state.configuration}
            isValid={isValid}
            livePreview={livePreview}
            onNext={moveNext}
            onReset={() => updateConfiguration({ styleId: null })}
          />
        ) : state.currentStep === 3 ? (
          <MaterialsPreview configuration={state.configuration} />
        ) : <aside aria-label="ภาพตัวอย่างบ้าน" className={styles.preview} data-mobile-preview-ratio="16:10" data-preview-material={livePreview.material.level} data-preview-style={livePreview.concept.id}>
          <div className={styles.imageFrame} data-preview-tone={livePreview.material.level}>
            <Image alt={`ภาพอ้างอิง ${livePreview.concept.thaiLabel} (${livePreview.concept.englishLabel})`} fill key={livePreview.concept.id} preload sizes="(max-width: 899px) 100vw, 50vw" src={livePreview.concept.image} />
          </div>
          <div className={styles.previewCopy} aria-live="polite">
            <p>CONCEPT PREVIEW</p>
            <h2>{livePreview.concept.thaiLabel}</h2>
            <span className={styles.previewEnglish}>{livePreview.concept.englishLabel}</span>
            <span className={styles.previewDescription}>{livePreview.concept.description}</span>
            {areaError ? <span>พื้นที่ใช้สอยที่กำลังกรอกไม่ถูกต้อง</span> : <dl className={styles.metricList}>{livePreview.metricRows.map((metric, metricIndex) => {
              const label = metric.id === "construction-floor-area" ? "CFA" : metric.label;
              const value = `${metric.value}${metric.id === "usable-area" ? state.configuration.usableAreaOverrideM2 ? " (กำหนดเอง)" : " (แนะนำ)" : ""}`;
              const isMobileOptional = !["floors", "bedrooms", "bathrooms", "usable-area"].includes(metric.id);
              const columnClass = metricIndex % 2 === 0 ? styles.metricColumnLeft : styles.metricColumnRight;
              return <div className={`${columnClass}${isMobileOptional ? ` ${styles.mobileOptionalMetric}` : ""}`} data-live-metric={metric.id} key={metric.id}><dt>{label}</dt><dd className="tabularNumbers">{value}<span aria-hidden="true" className={styles.metricSummary}>{label} {value}</span></dd></div>;
            })}</dl>}
            <span className={styles.previewMaterialLevel}>ระดับวัสดุ {livePreview.material.label}</span>
            <span className={styles.previewMaterialDescription}>{livePreview.material.description}</span>
            <ul aria-label={`ตัวอย่างวัสดุระดับ ${livePreview.material.label}`} className={styles.materialPalette}>
              {livePreview.material.swatches.map((swatch) => (
                <li className={styles.materialSwatch} key={swatch.label} style={{ "--swatch-color": swatch.color } as CSSProperties}>
                  <span aria-hidden="true" className={styles.materialSwatchColor} />
                  <span>{swatch.label}</span>
                </li>
              ))}
            </ul>
            {livePreview.activeFeatures.length > 0 ? <span className={styles.previewFeatures}>ส่วนพิเศษ {livePreview.activeFeatures.map((feature) => feature.label).join(" · ")}</span> : null}
            <span className={styles.previewDisclaimer} data-preview-disclaimer="always-visible">ภาพอ้างอิงทิศทางการออกแบบ ไม่ใช่แบบก่อสร้าง</span>
          </div>
        </aside>}
        {state.currentStep === 3 ? navigationActions : null}
      </div>
    </main>
  );
}
