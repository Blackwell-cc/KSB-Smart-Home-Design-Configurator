import { render, screen, within } from "@testing-library/react";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import { QA_AREA_CATALOG } from "@/features/area-planning/domain/area-catalog";
import { VISIBLE_CONCEPT_CATALOG } from "@/features/preview/domain/concept-catalog";
import { createConfiguratorStore } from "../state/configurator-store";
import type { DraftStorage } from "../state/draft-storage";
import { ConfiguratorShell } from "./configurator-shell";

function createMemoryDraftStorage(): DraftStorage {
  let draft: ReturnType<DraftStorage["load"]> = { status: "none" };

  return {
    load: () => draft,
    save: (currentStep, configuration) => {
      draft = { status: "valid", draft: { draftVersion: 1, currentStep, configuration } };
      return { status: "saved" };
    },
    clear: () => {
      draft = { status: "none" };
      return { status: "cleared" };
    },
  };
}

function renderConfigurator() {
  const store = createConfiguratorStore(createMemoryDraftStorage(), 0);
  const onPreview = vi.fn();
  const user = userEvent.setup();
  const view = render(<ConfiguratorShell onPreview={onPreview} store={store} />);
  return { ...view, onPreview, store, user };
}

async function chooseStyleAndContinue(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: "Modern Style" }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
}

async function openStepThree(user: ReturnType<typeof userEvent.setup>) {
  await chooseStyleAndContinue(user);
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  expect(screen.getByRole("heading", { name: "กำหนดงบประมาณ" })).toHaveFocus();
}

async function chooseProvince(user: ReturnType<typeof userEvent.setup>, name = "กรุงเทพมหานคร") {
  const province = screen.getByRole("combobox", { name: "จังหวัด" });
  await user.clear(province);
  await user.type(province, name);
  await user.click(screen.getByRole("option", { name }));
}

async function chooseSiteAccess(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("combobox", { name: "สภาพการเข้าถึงหน้างาน" }));
  await user.click(screen.getByRole("option", { name }));
}

async function continueToReview(user: ReturnType<typeof userEvent.setup>) {
  await chooseStyleAndContinue(user);
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await chooseProvince(user);
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.click(screen.getByRole("radio", { name: /PREMIUM/i }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
}

test("moves through five PII-free steps and navigates to the preview only after review", async () => {
  const { onPreview, user } = renderConfigurator();

  expect(screen.getByRole("heading", { name: "เลือกรูปแบบบ้าน" })).toBeInTheDocument();
  expect(screen.queryByLabelText(/เบอร์โทร|อีเมล|LINE/i)).not.toBeInTheDocument();

  await continueToReview(user);

  expect(screen.getByRole("heading", { name: "ตรวจสอบความถูกต้อง" })).toBeInTheDocument();
  expect(within(screen.getByTestId("step-five-preview")).getByTestId("material-preview-scene")).toHaveAttribute(
    "data-scene",
    "modern-2f",
  );
  expect(screen.queryByText(/ราคาก่อสร้าง|บาท\/ตร\.ม\.|งบประมาณโดยประมาณ/)).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "ไปยังหน้าสรุปค่าใช้จ่าย" }));
  expect(onPreview).toHaveBeenCalledWith("/preview");
});

test("renders Step 5 as a read-only live review with readable Step 1–4 values", async () => {
  const { store, user } = renderConfigurator();
  await act(async () => {
    store.getState().updateConfiguration({
      styleId: "modern-tropical-resort",
      residents: 5,
      floors: 2,
      bedrooms: 5,
      bathrooms: 4,
      parkingSpaces: 3,
      functions: { office: true, elderlyRoom: true, thaiKitchen: false, multipurposeRoom: false },
      additionalRequirements: ["home-theater"],
      usableAreaOverrideM2: 530,
      provinceCode: "10",
      district: "บางรัก",
      siteAccess: "restricted",
      budgetRangeId: "40m_80m",
      targetBudget: { min: 40_000_000, max: 80_000_000 },
      materialSelections: {
        roof: "concrete-tile",
        wall: "natural-stone",
        window: "black-aluminium",
        door: "teak",
        flooring: "natural-marble",
      },
      materialQualityId: "signature",
      specialFeatures: ["pool", "smart-home", "ev-charger"],
    });
    store.getState().setCurrentStep(4);
  });

  expect(screen.getByRole("heading", { name: "ตรวจสอบความถูกต้อง" })).toBeInTheDocument();
  expect(screen.getByText("Modern Tropical Resort")).toBeInTheDocument();
  expect(screen.getByText(/5 ห้องนอน · 4 ห้องน้ำ · 2 ชั้น/)).toBeInTheDocument();
  expect(screen.getByText(/ห้องทำงาน · ห้องผู้สูงอายุ · ห้องดูหนัง/)).toBeInTheDocument();
  expect(screen.getByText("40–80 ล้านบาท")).toBeInTheDocument();
  expect(screen.getByText(/กรุงเทพมหานคร · บางรัก/)).toBeInTheDocument();
  expect(screen.getByText("หินธรรมชาติ")).toBeInTheDocument();
  expect(screen.getByText("อลูมิเนียมสีดำ")).toBeInTheDocument();
  expect(screen.getByText("SIGNATURE")).toBeInTheDocument();
  expect(screen.getByText("ระบบ Smart Home")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "ส่วนพิเศษ สระว่ายน้ำ" })).toHaveAttribute("src", "/materials/special-features/1.png");
  expect(screen.getByRole("img", { name: "ส่วนพิเศษ ระบบ Smart Home" })).toHaveAttribute("src", "/materials/special-features/3.png");
  expect(screen.getByRole("img", { name: "ส่วนพิเศษ ที่ชาร์จรถ EV" })).toHaveAttribute("src", "/materials/special-features/5.png");
  expect(within(screen.getByRole("navigation", { name: "การดำเนินการขั้นตอนที่ 5" })).getAllByRole("button")).toHaveLength(2);
  expect(screen.getAllByRole("button", { name: "บันทึกแบบร่าง" })).toHaveLength(1);
  expect(within(screen.getByTestId("step-five-preview")).getByRole("img", { name: "Tropical Resort 2 ชั้น" })).toHaveAttribute("src", expect.stringContaining("modern-tropical-resort.png"));
  expect(screen.getByRole("img", { name: "วัสดุหลังคา กระเบื้องคอนกรีต" })).toHaveAttribute("src", "/materials/roof/1.png");
  expect(screen.getByRole("img", { name: "วัสดุผนังภายนอก หินธรรมชาติ" })).toHaveAttribute("src", "/materials/wall/2.png");
  expect(screen.getByRole("img", { name: "วัสดุหน้าต่าง อลูมิเนียมสีดำ" })).toHaveAttribute("src", "/materials/window/1.png");
  expect(screen.getByRole("img", { name: "วัสดุประตูทางเข้า โมเดิร์น" })).toHaveAttribute("src", "/materials/door/4.png");
  expect(screen.queryByRole("img", { name: /วัสดุพื้น/ })).not.toBeInTheDocument();
  expect(screen.queryByText(/elderlyRoom|home-theater|natural-stone|black-aluminium/)).not.toBeInTheDocument();
  expect(screen.queryByText(/ราคาก่อสร้าง|บาท\/ตร\.ม\.|งบประมาณโดยประมาณ/)).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "แก้ไขพื้นที่และฟังก์ชัน" }));
  expect(screen.getByRole("heading", { name: "พื้นที่และฟังก์ชัน" })).toHaveFocus();
  await act(async () => {
    store.getState().updateConfiguration({ bedrooms: 6 });
    store.getState().setCurrentStep(4);
  });
  expect(screen.getByText(/6 ห้องนอน · 4 ห้องน้ำ · 2 ชั้น/)).toBeInTheDocument();
});

test("renders the premium step-one workspace from the approved reference", () => {
  renderConfigurator();

  expect(screen.getByText("SMART HOME DESIGN CONFIGURATOR")).toBeInTheDocument();
  const homeLogo = screen.getByRole("link", { name: "KSB Architect หน้าแรก" });
  expect(homeLogo).toHaveAttribute("href", "/");
  expect(decodeURIComponent(within(homeLogo).getByRole("img", { name: "KSB Architect" }).getAttribute("src") ?? ""))
    .toContain("/brand/ksb-architect-logo.png");
  expect(screen.getByRole("heading", { name: "เลือกรูปแบบบ้าน" })).not.toHaveFocus();
  expect(screen.getByText("เลือกสไตล์ที่ใช่ เพื่อเริ่มออกแบบบ้านในแบบของคุณ")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "คู่มือการใช้งาน" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "บันทึกแบบร่าง" })).toBeInTheDocument();

  expect(screen.queryByRole("group", { name: "กรองรูปแบบบ้าน" })).not.toBeInTheDocument();

  const choices = screen.getByRole("radiogroup", { name: "เลือกสไตล์บ้าน" });
  expect(within(choices).getAllByRole("radio")).toHaveLength(7);
  for (const styleName of ["Classic Style", "Modern Style", "Nordic Style", "Loft Style", "Minimalist Style", "Tropical", "Contemporary"]) {
    expect(within(choices).getByRole("radio", { name: styleName })).toBeInTheDocument();
  }
  expect(screen.queryByText("TROPICAL RESORT 02")).not.toBeInTheDocument();

  const preview = screen.getByRole("complementary", { name: "พื้นที่แสดงแบบบ้าน" });
  expect(within(preview).getByText("ประเภทบ้าน")).toBeInTheDocument();
  expect(within(preview).queryByText("โซนสวน")).not.toBeInTheDocument();
  expect(within(preview).queryByText("โซนสระว่ายน้ำ")).not.toBeInTheDocument();
  expect(within(preview).queryByText("32.00 ม.")).not.toBeInTheDocument();
  expect(within(preview).getByText("สเป็กที่แนะนำสำหรับบ้านสไตล์นี้")).toBeInTheDocument();
  expect(within(preview).getByRole("button", { name: "แชร์แบบร่าง" })).toBeDisabled();
  expect(within(preview).getByRole("button", { name: "รีเซ็ตตัวเลือก" })).toBeInTheDocument();
  const next = within(preview).getByRole("button", { name: "ถัดไป" });
  expect(next).toBeDisabled();
  expect(within(next).getByText("ขั้นตอนที่ 2")).toBeInTheDocument();
});

test("gates required steps, describes validation errors, and focuses the new step heading", async () => {
  const { user } = renderConfigurator();
  const layout = screen.getByTestId("configurator-layout");
  const next = screen.getByRole("button", { name: "ถัดไป" });
  const styleChoices = screen.getByRole("radiogroup", { name: "เลือกสไตล์บ้าน" });

  expect(next).toBeDisabled();
  expect(layout).toHaveAttribute("data-step", "style");
  expect(styleChoices).toHaveAttribute("aria-describedby", "style-error");
  expect(screen.getByRole("alert")).toHaveAttribute("id", "style-error");

  await chooseStyleAndContinue(user);

  expect(layout).toHaveAttribute("data-step", "functions");
  expect(screen.getByRole("heading", { name: "พื้นที่และฟังก์ชัน" })).toHaveFocus();
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  expect(screen.getByRole("heading", { name: "กำหนดงบประมาณ" })).toHaveFocus();
  expect(screen.getByRole("button", { name: "ถัดไป" })).toBeDisabled();
});

test("restores the current step and chosen values when the shell remounts with its injected draft store", async () => {
  const storage = createMemoryDraftStorage();
  const store = createConfiguratorStore(storage, 0);
  const first = render(<ConfiguratorShell store={store} />);
  const user = userEvent.setup();

  await chooseStyleAndContinue(user);
  await user.click(screen.getByRole("button", { name: /จำนวนผู้อยู่อาศัย.*เพิ่ม/ }));
  first.unmount();
  render(<ConfiguratorShell store={store} />);

  expect(screen.getByRole("heading", { name: "พื้นที่และฟังก์ชัน" })).toBeInTheDocument();
  expect(screen.getByRole("spinbutton", { name: "จำนวนผู้อยู่อาศัย" })).toHaveValue(5);
});

test("back navigation preserves previous choices and the live preview reflects the selected concept and room program", async () => {
  const { user } = renderConfigurator();
  const initialPreview = screen.getByRole("img", { name: /Classic Style/i });
  const initialSource = initialPreview.getAttribute("src");

  await user.click(screen.getByRole("radio", { name: "Nordic Style" }));
  expect(screen.getByRole("img", { name: /Nordic Style/i })).not.toHaveAttribute("src", initialSource);
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.click(screen.getByRole("button", { name: /จำนวนห้องนอน.*เพิ่ม/ }));
  expect(screen.getByText(/^พื้นที่ใช้สอย 178/)).toHaveTextContent("(แนะนำ)");
  await user.click(screen.getByRole("button", { name: "ย้อนกลับ" }));

  expect(screen.getByRole("radio", { name: "Nordic Style" })).toBeChecked();
});

test("changes the Step 2 preview image when the selected floor count changes", async () => {
  const { user } = renderConfigurator();
  await user.click(screen.getByRole("radio", { name: "Nordic Style" }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));

  const preview = screen.getByRole("complementary", { name: "ภาพตัวอย่างพื้นที่และฟังก์ชัน" });
  expect([...preview.querySelectorAll("[data-floor-image-preload]")].map((image) => decodeURIComponent(image.getAttribute("src") ?? "")))
    .toEqual(expect.arrayContaining([
      expect.stringContaining("/concepts/base-nordic-1f-master.webp"),
      expect.stringContaining("/concepts/base-nordic-2f-master.webp"),
      expect.stringContaining("/concepts/base-nordic-3f-master.webp"),
    ]));
  const imageSource = () => decodeURIComponent(within(preview).getByRole("img", { name: /บ้านสไตล์นอร์ดิก/ }).getAttribute("src") ?? "");
  expect(imageSource()).toContain("/concepts/base-nordic-2f-master.webp");

  await user.click(screen.getByRole("button", { name: /จำนวนชั้น.*ลด/ }));
  expect(imageSource()).toContain("/concepts/base-nordic-1f-master.webp");

  await user.click(screen.getByRole("button", { name: /จำนวนชั้น.*เพิ่ม/ }));
  await user.click(screen.getByRole("button", { name: /จำนวนชั้น.*เพิ่ม/ }));
  expect(imageSource()).toContain("/concepts/base-nordic-3f-master.webp");
});

test("renders the architectural planning stage from the current style", async () => {
  const { user } = renderConfigurator();
  const preview = screen.getByRole("complementary", { name: "พื้นที่แสดงแบบบ้าน" });

  await user.click(screen.getByRole("radio", { name: "Nordic Style" }));

  expect(within(preview).getByRole("heading", { name: "บ้านสไตล์นอร์ดิก" })).toBeInTheDocument();
  expect(within(preview).getByText("200–300 ตร.ม.")).toBeInTheDocument();
  expect(within(preview).getByText("ครอบครัวที่ชอบธรรมชาติ")).toBeInTheDocument();
  expect(within(preview).getByRole("img", { name: /Nordic Style/i })).toBeInTheDocument();
  expect(within(preview).getByText("ภาพ Mockup สำหรับวางแผนเบื้องต้น ไม่ใช่แบบก่อสร้าง")).toBeInTheDocument();
});

test("exposes ordered progress, named counter controls, accessible choice groups, and responsive layout semantics", async () => {
  const { user } = renderConfigurator();
  const progress = screen.getByRole("list", { name: "ขั้นตอนการออกแบบบ้าน" });

  expect(within(progress).getAllByRole("listitem")).toHaveLength(5);
  expect(screen.getByTestId("configurator-layout")).toHaveAttribute("data-responsive-layout", "split-preview");
  expect(screen.getByRole("radio", { name: "Modern Style" })).toBeInTheDocument();

  await chooseStyleAndContinue(user);

  expect(screen.getByRole("spinbutton", { name: "จำนวนชั้น" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /จำนวนชั้น.*ลด/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /จำนวนชั้น.*เพิ่ม/ })).toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: "ห้องทำงาน" })).toBeInTheDocument();
});

test("renders the clean Step 2 preview and a live summary below it", async () => {
  const { user } = renderConfigurator();
  await chooseStyleAndContinue(user);

  const preview = screen.getByRole("complementary", { name: "ภาพตัวอย่างพื้นที่และฟังก์ชัน" });
  expect(within(preview).getByRole("img", { name: /Modern Style/i })).toBeInTheDocument();
  expect(within(preview).queryByText("CONCEPT PREVIEW")).not.toBeInTheDocument();
  expect(within(preview).queryByRole("heading", { name: "บ้านสไตล์โมเดิร์น" })).not.toBeInTheDocument();

  const summary = within(preview).getByRole("region", { name: "สรุปรายการพื้นที่และฟังก์ชัน" });
  for (const label of ["ผู้อยู่อาศัย", "ชั้น", "ห้องนอน", "ห้องน้ำ", "ที่จอดรถ", "พื้นที่ใช้สอย"]) {
    expect(within(summary).getByText(label)).toBeInTheDocument();
  }

  await user.click(screen.getByRole("checkbox", { name: "ห้องทำงาน" }));
  expect(within(summary).getByText("ฟังก์ชันเพิ่มเติมที่เลือก")).toBeInTheDocument();
  expect(within(summary).getByText("ห้องทำงาน")).toBeInTheDocument();
});

test("stores the extended Step 2 carousel choices as requirements without changing area", async () => {
  const { store, user } = renderConfigurator();
  await chooseStyleAndContinue(user);
  const before = calculateArea(store.getState().configuration, QA_AREA_CATALOG);

  const carousel = screen.getByRole("region", { name: "ตัวเลือกฟังก์ชันและความต้องการเพิ่มเติม" });
  expect(within(carousel).getAllByRole("checkbox")).toHaveLength(12);
  expect(screen.getByRole("button", { name: "เลื่อนตัวเลือกไปทางซ้าย" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "เลื่อนตัวเลือกไปทางขวา" })).toBeInTheDocument();
  await user.click(within(carousel).getByRole("checkbox", { name: "ห้องฟิตเนส" }));

  expect(store.getState().configuration.additionalRequirements).toEqual(["fitness"]);
  expect(calculateArea(store.getState().configuration, QA_AREA_CATALOG)).toEqual(before);
  expect(screen.getByText("ฟังก์ชันเพิ่มเติมที่เลือก")).toBeInTheDocument();
  expect(screen.getAllByText("ห้องฟิตเนส").length).toBeGreaterThan(1);
});

test("treats every Step 2 function as requirement-only and presents one selected list", async () => {
  const { store, user } = renderConfigurator();
  await chooseStyleAndContinue(user);
  const before = calculateArea(store.getState().configuration, QA_AREA_CATALOG);

  expect(screen.queryByText(/มีผลต่อพื้นที่ใช้สอยที่แนะนำ/)).not.toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "ห้องทำงาน" }));
  await user.click(screen.getByRole("checkbox", { name: "ห้องฟิตเนส" }));

  expect(calculateArea(store.getState().configuration, QA_AREA_CATALOG)).toEqual(before);
  expect(screen.getAllByText("ฟังก์ชันเพิ่มเติมที่เลือก")).toHaveLength(1);
  expect(screen.queryByText("รายการความต้องการที่บันทึก")).not.toBeInTheDocument();
});

test("connects the Step 2 area slider and numeric value to the existing configuration state", async () => {
  const { store, user } = renderConfigurator();
  await chooseStyleAndContinue(user);

  const slider = screen.getByRole("slider", { name: "เลื่อนปรับขนาดพื้นที่" });
  expect(slider).toHaveAttribute("min", "60");
  expect(slider).toHaveAttribute("max", "1500");
  await user.clear(screen.getByRole("spinbutton", { name: /พื้นที่ใช้สอยที่ต้องการ/ }));
  await user.type(screen.getByRole("spinbutton", { name: /พื้นที่ใช้สอยที่ต้องการ/ }), "280");

  expect(slider).toHaveValue("280");
  expect(store.getState().configuration.usableAreaOverrideM2).toBe(280);
});

test("uses the selected usable-area override and site access in the review summary", async () => {
  const { user } = renderConfigurator();
  await chooseStyleAndContinue(user);
  await user.clear(screen.getByLabelText(/พื้นที่ใช้สอยที่ต้องการ/));
  await user.type(screen.getByLabelText(/พื้นที่ใช้สอยที่ต้องการ/), "220");
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await chooseProvince(user);
  await chooseSiteAccess(user, "ถนนค่อนข้างแคบ");
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));

  expect(screen.getByText(/พื้นที่ใช้สอย 220 ตร\.ม\./)).toBeInTheDocument();
  expect(screen.getByText(/ถนนค่อนข้างแคบ/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "แก้ไขพื้นที่และฟังก์ชัน" }));
  expect(screen.getByRole("heading", { name: "พื้นที่และฟังก์ชัน" })).toHaveFocus();
});

test("requires a valid usable-area override before continuing and clears it back to the recommendation", async () => {
  const { store, user } = renderConfigurator();
  await chooseStyleAndContinue(user);

  const usableArea = screen.getByRole("spinbutton", { name: /พื้นที่ใช้สอยที่ต้องการ/ });
  const next = screen.getByRole("button", { name: "ถัดไป" });
  await user.type(usableArea, "59");

  expect(next).toBeDisabled();
  expect(usableArea).toHaveAttribute("aria-describedby", "usable-area-help usable-area-error");
  expect(screen.getByText("โปรดระบุพื้นที่ใช้สอยระหว่าง 60–1,500 ตร.ม.")).toHaveAttribute("id", "usable-area-error");
  expect(store.getState().configuration.usableAreaOverrideM2).toBeNull();
  expect(screen.getByText("พื้นที่ใช้สอยที่กำลังกรอกไม่ถูกต้อง")).toBeInTheDocument();

  await user.clear(usableArea);
  await user.type(usableArea, "220");
  expect(next).toBeEnabled();
  expect(store.getState().configuration.usableAreaOverrideM2).toBe(220);
  expect(screen.getByText(/^พื้นที่ใช้สอย 220/)).toHaveTextContent("(กำหนดเอง)");

  await user.clear(usableArea);
  expect(next).toBeEnabled();
  expect(store.getState().configuration.usableAreaOverrideM2).toBeNull();
  expect(screen.getByText(/^พื้นที่ใช้สอย 164/)).toHaveTextContent("(แนะนำ)");
});

test("does not present an old override as current while the replacement is invalid", async () => {
  const store = createConfiguratorStore(createMemoryDraftStorage(), 0);
  act(() => {
    store.getState().updateConfiguration({ styleId: "contemporary-warm-luxury", usableAreaOverrideM2: 220 });
    store.getState().setCurrentStep(1);
  });
  const user = userEvent.setup();
  render(<ConfiguratorShell store={store} />);

  const usableArea = screen.getByRole("spinbutton", { name: /พื้นที่ใช้สอยที่ต้องการ/ });
  expect(usableArea).toHaveValue(220);
  await user.clear(usableArea);
  await user.type(usableArea, "59");

  expect(screen.getByRole("button", { name: "ถัดไป" })).toBeDisabled();
  expect(usableArea).toHaveValue(59);
  expect(store.getState().configuration.usableAreaOverrideM2).toBeNull();
  expect(screen.getByText("พื้นที่ใช้สอยที่กำลังกรอกไม่ถูกต้อง")).toBeInTheDocument();
  expect(screen.queryByText(/^พื้นที่ใช้สอย 220/)).not.toBeInTheDocument();
});

test("selects one budget range, updates compatibility values, and keeps open ranges non-authoritative", async () => {
  const { store, user } = renderConfigurator();
  await openStepThree(user);

  const group = screen.getByRole("radiogroup", { name: "งบประมาณที่วางไว้" });
  expect(within(group).getAllByRole("radio")).toHaveLength(7);
  expect(within(group).getByRole("radio", { name: "ยังไม่ระบุ" })).toBeChecked();

  await user.click(within(group).getByRole("radio", { name: "10–20 ล้านบาท" }));
  expect(store.getState().configuration).toMatchObject({
    budgetRangeId: "10m_20m",
    targetBudget: { min: 10_000_000, max: 20_000_000 },
  });

  await user.click(within(group).getByRole("radio", { name: "มากกว่า 80 ล้านบาท" }));
  expect(store.getState().configuration).toMatchObject({ budgetRangeId: "over_80m", targetBudget: null });
});

test("shows the selected budget with color only and without a check mark", async () => {
  const { user } = renderConfigurator();
  await openStepThree(user);

  const group = screen.getByRole("radiogroup", { name: "งบประมาณที่วางไว้" });
  const selectedBudget = within(group).getByRole("radio", { name: "5–10 ล้านบาท" });
  await user.click(selectedBudget);

  expect(selectedBudget.closest("label")).toHaveAttribute("data-selected", "true");
  expect(within(group).queryByText("✓")).not.toBeInTheDocument();
});

test("allows Step 3 to continue with an unspecified budget while still requiring province", async () => {
  const { user } = renderConfigurator();
  await openStepThree(user);
  const next = screen.getByRole("button", { name: "ถัดไป" });
  expect(next).toBeDisabled();
  await chooseProvince(user);
  expect(next).toBeEnabled();
});

test("preserves the selected budget after back navigation", async () => {
  const { user } = renderConfigurator();
  await openStepThree(user);
  await chooseProvince(user);
  await user.click(screen.getByRole("radio", { name: "20–40 ล้านบาท" }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.click(screen.getByRole("button", { name: "ย้อนกลับ" }));
  expect(screen.getByRole("radio", { name: "20–40 ล้านบาท" })).toBeChecked();
});

test("shows a clean Step 3 concept preview and updates its separate summary", async () => {
  const { user } = renderConfigurator();
  await openStepThree(user);

  const preview = screen.getByRole("complementary", { name: "ตัวอย่างแนวคิดบ้าน" });
  expect(within(preview).getByRole("img", { name: /ภาพแนวคิดบ้าน/ })).toBeInTheDocument();
  expect(within(preview).queryByText("3D")).not.toBeInTheDocument();
  expect(within(preview).queryByRole("button")).not.toBeInTheDocument();

  const summary = screen.getByRole("region", { name: "สรุปข้อมูลเบื้องต้น" });
  expect(summary).toHaveTextContent("ยังไม่ระบุ");
  await chooseProvince(user);
  await user.click(screen.getByRole("radio", { name: "10–20 ล้านบาท" }));
  expect(summary).toHaveTextContent("กรุงเทพมหานคร");
  expect(summary).toHaveTextContent("10–20 ล้านบาท");
});

test("does not create an unchanged draft on unmount and never recreates a cleared draft", () => {
  const storage = createMemoryDraftStorage();
  const unchangedStore = createConfiguratorStore(storage, 300);
  const unchanged = render(<ConfiguratorShell store={unchangedStore} />);
  unchanged.unmount();
  expect(storage.load().status).toBe("none");

  const clearedStore = createConfiguratorStore(storage, 300);
  const cleared = render(<ConfiguratorShell store={clearedStore} />);
  act(() => {
    clearedStore.getState().setCurrentStep(1);
    clearedStore.getState().clearDraftAfterPrivateProjectCreated();
  });
  cleared.unmount();
  expect(storage.load().status).toBe("none");
});

test("flushes the latest edit on pagehide before unmount", () => {
  const storage = createMemoryDraftStorage();
  const store = createConfiguratorStore(storage, 300);
  const view = render(<ConfiguratorShell store={store} />);

  act(() => {
    store.getState().updateConfiguration({ residents: 6 });
    window.dispatchEvent(new Event("pagehide"));
  });
  view.unmount();

  const restored = createConfiguratorStore(storage).getState();
  expect(restored.configuration.residents).toBe(6);
});

test("supports native arrow-key quality selection and blocks preview for an incomplete restored review", async () => {
  const store = createConfiguratorStore(createMemoryDraftStorage(), 0);
  store.getState().setCurrentStep(4);
  const onPreview = vi.fn();
  const user = userEvent.setup();
  render(<ConfiguratorShell onPreview={onPreview} store={store} />);

  await user.click(screen.getByRole("button", { name: "ไปยังหน้าสรุปค่าใช้จ่าย" }));
  expect(onPreview).not.toHaveBeenCalled();
  expect(screen.getByRole("heading", { name: "เลือกรูปแบบบ้าน" })).toHaveFocus();

  await act(async () => {
    store.getState().updateConfiguration({ styleId: "contemporary-warm-luxury", provinceCode: "10" });
    store.getState().setCurrentStep(3);
  });
  const premium = screen.getByRole("radio", { name: /PREMIUM/i });
  premium.focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: /SIGNATURE/i })).toBeChecked();
  await user.keyboard("{ArrowLeft}");
  expect(screen.getByRole("radio", { name: /PREMIUM/i })).toBeChecked();
  await user.keyboard("{ArrowUp}");
  expect(screen.getByRole("radio", { name: /STANDARD/i })).toBeChecked();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("radio", { name: /PREMIUM/i })).toBeChecked();
});

test("presents every house style as an image-backed architect card", () => {
  renderConfigurator();

  const choices = screen.getByRole("radiogroup", { name: "เลือกสไตล์บ้าน" });
  const cards = within(choices).getAllByRole("radio");

  expect(cards).toHaveLength(VISIBLE_CONCEPT_CATALOG.length);
  VISIBLE_CONCEPT_CATALOG.forEach((concept) => {
    const card = within(choices).getByRole("radio", { name: concept.label }).closest("label");
    expect(card).toHaveAttribute("data-style-card", "true");
    expect(card?.querySelector("img")).toHaveAttribute("src", expect.stringContaining(encodeURIComponent(concept.image)));
    expect(within(card as HTMLElement).getByText(concept.thaiLabel)).toBeInTheDocument();
  });
});

test("keeps every Step 1 house presentation fixed to the two-floor model", () => {
  const { store } = renderConfigurator();

  act(() => {
    store.getState().updateConfiguration({ floors: 3 });
  });

  const preview = screen.getByRole("complementary", { name: "พื้นที่แสดงแบบบ้าน" });
  const previewImage = within(preview).getByRole("img", { name: /ภาพจำลองบ้านสไตล์/ });
  expect(decodeURIComponent(previewImage.getAttribute("src") ?? "")).toContain("/material-previews/classic/2f/base.webp?v=20260911-classic-2f-ai-v1");
  expect(within(preview).getByText("2 ชั้น")).toBeInTheDocument();

  const choices = screen.getByRole("radiogroup", { name: "เลือกสไตล์บ้าน" });
  const nordicCard = within(choices).getByRole("radio", { name: "Nordic Style" }).closest("label");
  expect(within(nordicCard as HTMLElement).getByText("2 ชั้น")).toBeInTheDocument();
});

test("resets the floor default to two when a Step 1 style is selected", async () => {
  const { store, user } = renderConfigurator();

  act(() => {
    store.getState().updateConfiguration({ floors: 3 });
  });
  await user.click(screen.getByRole("radio", { name: "Modern Style" }));

  expect(store.getState().configuration.floors).toBe(2);
});

test("carries the two-floor default into Step 2 for a restored style selection", async () => {
  const { store, user } = renderConfigurator();

  act(() => {
    store.getState().updateConfiguration({ styleId: "classic-style", floors: 3 });
  });
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));

  expect(store.getState().configuration.floors).toBe(2);
  expect(screen.getByRole("spinbutton", { name: "จำนวนชั้น" })).toHaveValue(2);
});

test("marks preview data and mobile-safe landmarks for the active selection", () => {
  const { store } = renderConfigurator();

  const preview = screen.getByRole("complementary", { name: "พื้นที่แสดงแบบบ้าน" });
  const form = screen.getByRole("region", { name: "เลือกรูปแบบบ้าน" });
  expect(preview).toHaveAttribute("data-preview-style", "classic-style");
  expect(preview).toHaveAttribute("data-preview-material", "premium");
  expect(preview).toHaveAttribute("data-mobile-preview-ratio", "16:10");
  expect(form).toHaveAttribute("data-choice-canvas", "true");

  act(() => {
    store.getState().setCurrentStep(3);
  });

  expect(screen.getByTestId("material-scroll-area")).toBeInTheDocument();
});

test("renders supplied photography in the requested material-option order", () => {
  const { store } = renderConfigurator();
  act(() => store.getState().setCurrentStep(3));

  const scrollArea = screen.getByTestId("material-scroll-area");
  const materialGroups = within(scrollArea).getAllByRole("radiogroup");
  expect(materialGroups).toHaveLength(4);
  materialGroups.forEach((group) => expect(within(group).getAllByRole("radio")).toHaveLength(4));

  const roofGroup = within(scrollArea).getByRole("radiogroup", { name: "หลังคา" });
  expect([...roofGroup.querySelectorAll("img")].map((image) => {
    const src = image.getAttribute("src") ?? "";
    return new URL(src, "http://localhost").searchParams.get("url") ?? src;
  })).toEqual([
    "/materials/roof/1.png",
    "/materials/roof/2.png",
    "/materials/roof/3.png",
    "/materials/roof/4.png",
  ]);

  const wallGroup = within(scrollArea).getByRole("radiogroup", { name: "ผนังภายนอก" });
  expect([...wallGroup.querySelectorAll("img")].map((image) => {
    const src = image.getAttribute("src") ?? "";
    return new URL(src, "http://localhost").searchParams.get("url") ?? src;
  })).toEqual([
    "/materials/wall/1.png",
    "/materials/wall/2.png",
    "/materials/wall/3.png",
    "/materials/wall/4.png",
  ]);

  const windowGroup = within(scrollArea).getByRole("radiogroup", { name: "หน้าต่าง" });
  expect([...windowGroup.querySelectorAll("img")].map((image) => {
    const src = image.getAttribute("src") ?? "";
    return new URL(src, "http://localhost").searchParams.get("url") ?? src;
  })).toEqual([
    "/materials/window/1.png",
    "/materials/window/2.png",
    "/materials/window/4.png",
    "/materials/window/3.png",
  ]);

  const doorGroup = within(scrollArea).getByRole("radiogroup", { name: "ประตูทางเข้า" });
  expect([...doorGroup.querySelectorAll("img")].map((image) => {
    const src = image.getAttribute("src") ?? "";
    return new URL(src, "http://localhost").searchParams.get("url") ?? src;
  })).toEqual([
    "/materials/door/4.png",
    "/materials/door/1.png",
    "/materials/door/2.png",
    "/materials/door/3.png",
  ]);

  expect(within(scrollArea).queryByRole("radiogroup", { name: "พื้น" })).not.toBeInTheDocument();

  expect(within(scrollArea).queryAllByTestId("material-asset-placeholder")).toHaveLength(0);
});

test("shows the defining Loft roof and exterior wall choices as disabled while keeping window and door editable", () => {
  const { store } = renderConfigurator();
  act(() => {
    store.getState().updateConfiguration({ styleId: "loft-style", floors: 1 });
    store.getState().setCurrentStep(3);
  });

  const scrollArea = screen.getByTestId("material-scroll-area");
  const roofGroup = within(scrollArea).getByRole("radiogroup", { name: "หลังคา" });
  const wallGroup = within(scrollArea).getByRole("radiogroup", { name: "ผนังภายนอก" });
  expect(within(roofGroup).getAllByRole("radio")).toHaveLength(4);
  expect(within(wallGroup).getAllByRole("radio")).toHaveLength(4);
  within(roofGroup).getAllByRole("radio").forEach((radio) => expect(radio).toBeDisabled());
  within(wallGroup).getAllByRole("radio").forEach((radio) => expect(radio).toBeDisabled());
  expect(roofGroup.closest("fieldset")).toHaveAttribute("data-locked", "true");
  expect(wallGroup.closest("fieldset")).toHaveAttribute("data-locked", "true");
  expect(within(scrollArea).getByRole("radiogroup", { name: "หน้าต่าง" })).toBeInTheDocument();
  expect(within(scrollArea).getByRole("radiogroup", { name: "ประตูทางเข้า" })).toBeInTheDocument();
  expect(within(scrollArea).getByText("ล็อกตามดีไซน์ Loft")).toBeInTheDocument();
  expect(within(scrollArea).getByText(/หลังคาและผนังภายนอกเป็นองค์ประกอบหลักที่กำหนดเอกลักษณ์ของบ้านสไตล์ Loft/)).toBeInTheDocument();
});

test("selects materials, multiple features, and bespoke quality", async () => {
  const { store, user } = renderConfigurator();
  act(() => store.getState().setCurrentStep(3));

  const scrollArea = screen.getByTestId("material-scroll-area");
  const qualityGroup = screen.getByRole("radiogroup", { name: "ระดับคุณภาพวัสดุ" });
  expect(scrollArea).not.toContainElement(qualityGroup);

  await user.click(screen.getByRole("radio", { name: "หลังคาเมทัลชีท" }));
  await user.click(screen.getByRole("checkbox", { name: "สระว่ายน้ำ" }));
  await user.click(screen.getByRole("checkbox", { name: "สวนภายในบ้าน" }));
  await user.click(screen.getByRole("radio", { name: /BESPOKE/ }));

  expect(store.getState().configuration).toMatchObject({
    materialSelections: { roof: "metal-roof" },
    specialFeatures: ["pool", "internal-garden"],
    materialQualityId: "bespoke",
    materialLevel: "signature",
  });
});

test("orders compact Step 4 as selector, quality, preview, summary, then one action pair", () => {
  const { store } = renderConfigurator();
  act(() => store.getState().setCurrentStep(3));

  const selector = screen.getByTestId("material-scroll-area");
  const quality = screen.getByRole("radiogroup", { name: "ระดับคุณภาพวัสดุ" });
  const preview = screen.getByTestId("material-preview-scene");
  const summary = screen.getByRole("heading", { name: "สรุปวัสดุที่เลือก" });
  const back = screen.getByRole("button", { name: "ย้อนกลับ" });
  const next = screen.getByRole("button", { name: "ถัดไป" });

  expect(selector.compareDocumentPosition(quality) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(quality.compareDocumentPosition(preview) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(preview.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(summary.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(back.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getAllByRole("button", { name: "ย้อนกลับ" })).toHaveLength(1);
  expect(screen.getAllByRole("button", { name: "ถัดไป" })).toHaveLength(1);
});

test("keeps the mobile vertical-list contract and the mockup disclaimer visible", () => {
  renderConfigurator();

  const preview = screen.getByRole("complementary", { name: "พื้นที่แสดงแบบบ้าน" });
  const form = screen.getByRole("region", { name: "เลือกรูปแบบบ้าน" });
  expect(screen.getByRole("radiogroup", { name: "เลือกสไตล์บ้าน" })).toHaveAttribute("data-style-layout", "vertical-list");
  expect(screen.getByText("ภาพ Mockup สำหรับวางแผนเบื้องต้น ไม่ใช่แบบก่อสร้าง")).toHaveAttribute("data-preview-disclaimer", "always-visible");
  expect(form.compareDocumentPosition(preview) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test("updates the preview tone contract when the material level changes", async () => {
  const { store } = renderConfigurator();
  const preview = screen.getByRole("complementary", { name: "พื้นที่แสดงแบบบ้าน" });

  await act(async () => {
    store.getState().updateConfiguration({ materialLevel: "signature" });
  });

  expect(preview).toHaveAttribute("data-preview-material", "signature");
  expect(within(preview).getByRole("img", { name: /Classic Style/i }).parentElement).toHaveAttribute("data-preview-tone", "signature");
});

test("keeps Step 2 choices requirement-only while Step 4 describes mixed pricing support truthfully", async () => {
  const { store } = renderConfigurator();

  await act(async () => {
    store.getState().setCurrentStep(1);
  });
  expect(screen.queryByText(/มีผลต่อพื้นที่ใช้สอยที่แนะนำ/)).not.toBeInTheDocument();

  await act(async () => {
    store.getState().setCurrentStep(3);
  });
  expect(screen.queryByText("มีผลต่อ allowance และหมวดงบประมาณ")).not.toBeInTheDocument();
  expect(screen.getByText("รายการที่เลือกจะบันทึกเป็นความต้องการในการออกแบบ โดยเฉพาะรายการที่ยังไม่มีเกณฑ์ราคา")).toBeInTheDocument();
  expect(screen.getByText("ระดับคุณภาพวัสดุมีผลต่อคุณภาพโดยรวมและงบประมาณของโครงการ")).toBeInTheDocument();
});

test("renders supplied photography for the ten retained special-feature choices", () => {
  const { store } = renderConfigurator();
  act(() => store.getState().setCurrentStep(3));

  const featureGroup = screen.getByRole("group", { name: "ส่วนพิเศษที่อยากพิจารณา" });
  expect([...featureGroup.querySelectorAll("img")].map((image) => image.getAttribute("src"))).toEqual([
    "/materials/special-features/1.png",
    "/materials/special-features/2.png",
    "/materials/special-features/3.png",
    "/materials/special-features/4.png",
    "/materials/special-features/5.png",
    "/materials/special-features/6.png",
    "/materials/special-features/7.png",
    "/materials/special-features/8.png",
    "/materials/special-features/9.png",
    "/materials/special-features/10.png",
  ]);
  expect(within(featureGroup).queryByTestId("feature-asset-placeholder")).not.toBeInTheDocument();

  for (const removedLabel of ["โถง Double Volume", "สกายไลต์", "โฮมเธียเตอร์", "ห้องไวน์", "พื้นที่สำหรับสัตว์เลี้ยง"]) {
    expect(screen.queryByRole("checkbox", { name: removedLabel })).not.toBeInTheDocument();
  }
});

test("renders exactly four material quality radios", () => {
  const { store } = renderConfigurator();
  act(() => store.getState().setCurrentStep(3));

  const qualityGroup = screen.getByRole("radiogroup", { name: "ระดับคุณภาพวัสดุ" });
  expect(within(qualityGroup).getAllByRole("radio")).toHaveLength(4);
});

test("carries the selected house into Step 4 with a compact material summary", () => {
  const { store } = renderConfigurator();
  act(() => store.getState().setCurrentStep(3));

  const preview = screen.getByRole("complementary", { name: "ภาพตัวอย่างวัสดุ" });
  const scene = within(preview).getByTestId("material-preview-scene");
  expect(scene).toHaveAttribute("data-scene", "classic-2f");
  expect(scene).toHaveAttribute("data-available", "true");
  expect(within(preview).getByRole("img", { name: "Classic Style 2 ชั้น" })).toHaveAttribute(
    "src",
    expect.stringContaining(encodeURIComponent("/material-previews/classic/2f/base.webp?v=20260911-classic-2f-ai-v1")),
  );
  expect(within(preview).getAllByTestId("material-preview-layer")).toHaveLength(3);
  expect(within(preview).getByRole("heading", { name: "สรุปวัสดุที่เลือก" })).toBeInTheDocument();
  expect(preview).toHaveTextContent("กระเบื้องคอนกรีต");
  expect(preview).toHaveTextContent("PREMIUM");
  expect(within(preview).queryByText("CONCEPT PREVIEW")).not.toBeInTheDocument();
  expect(within(preview).queryByText("ภาพวัสดุของแบบนี้อยู่ระหว่างจัดเตรียม")).not.toBeInTheDocument();
});
