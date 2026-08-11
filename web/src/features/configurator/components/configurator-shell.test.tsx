import { render, screen, within } from "@testing-library/react";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
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
  await user.click(screen.getByRole("radio", { name: "Contemporary Warm Luxury" }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
}

async function continueToReview(user: ReturnType<typeof userEvent.setup>) {
  await chooseStyleAndContinue(user);
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.selectOptions(screen.getByLabelText("จังหวัด"), "10");
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.click(screen.getByRole("radio", { name: /Premium/ }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
}

test("moves through five PII-free steps and navigates to the preview only after review", async () => {
  const { onPreview, user } = renderConfigurator();

  expect(screen.getByRole("heading", { name: "เลือกรูปแบบบ้าน" })).toBeInTheDocument();
  expect(screen.queryByLabelText(/เบอร์โทร|อีเมล|LINE/i)).not.toBeInTheDocument();

  await continueToReview(user);

  expect(screen.getByRole("heading", { name: "ตรวจทานความต้องการ" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "ดู Preview" }));
  expect(onPreview).toHaveBeenCalledWith("/preview");
});

test("renders the premium step-one workspace from the approved reference", () => {
  renderConfigurator();

  expect(screen.getByText("SMART HOME DESIGN CONFIGURATOR")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "เลือกรูปแบบบ้าน" })).not.toHaveFocus();
  expect(screen.getByText("เลือกสไตล์ที่ใช่ เพื่อเริ่มออกแบบบ้านในแบบของคุณ")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "คู่มือการใช้งาน" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "บันทึกแบบร่าง" })).toBeInTheDocument();

  const filters = screen.getByRole("group", { name: "กรองรูปแบบบ้าน" });
  expect(within(filters).getAllByRole("button")).toHaveLength(5);
  expect(within(filters).getByRole("button", { name: "ทั้งหมด" })).toHaveAttribute("aria-pressed", "true");

  const choices = screen.getByRole("radiogroup", { name: "เลือกสไตล์บ้าน" });
  expect(within(choices).getAllByRole("radio")).toHaveLength(6);
  expect(screen.getByText("TROPICAL RESORT 02")).toBeInTheDocument();

  const preview = screen.getByRole("complementary", { name: "พื้นที่แสดงแบบบ้าน" });
  expect(within(preview).getByText("ประเภทบ้าน")).toBeInTheDocument();
  expect(within(preview).getByText("โซนสวน")).toBeInTheDocument();
  expect(within(preview).getByText("โซนสระว่ายน้ำ")).toBeInTheDocument();
  expect(within(preview).getByText("สเป็กที่แนะนำสำหรับบ้านสไตล์นี้")).toBeInTheDocument();
  expect(within(preview).getByRole("button", { name: "แชร์แบบร่าง" })).toBeDisabled();
  expect(within(preview).getByRole("button", { name: "รีเซ็ตตัวเลือก" })).toBeInTheDocument();
  const next = within(preview).getByRole("button", { name: "ถัดไป" });
  expect(next).toBeDisabled();
  expect(within(next).getByText("ขั้นตอนที่ 2")).toBeInTheDocument();
});

test("gates required steps, describes validation errors, and focuses the new step heading", async () => {
  const { user } = renderConfigurator();
  const next = screen.getByRole("button", { name: "ถัดไป" });
  const styleChoices = screen.getByRole("radiogroup", { name: "เลือกสไตล์บ้าน" });

  expect(next).toBeDisabled();
  expect(styleChoices).toHaveAttribute("aria-describedby", "style-error");
  expect(screen.getByRole("alert")).toHaveAttribute("id", "style-error");

  await chooseStyleAndContinue(user);

  expect(screen.getByRole("heading", { name: "พื้นที่และฟังก์ชัน" })).toHaveFocus();
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  expect(screen.getByRole("heading", { name: "ทำเลและงบประมาณ" })).toHaveFocus();
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
  const initialPreview = screen.getByRole("img", { name: /Contemporary Warm Luxury/i });
  const initialSource = initialPreview.getAttribute("src");

  await user.click(screen.getByRole("radio", { name: "Modern Tropical Resort" }));
  expect(screen.getByRole("img", { name: /Modern Tropical Resort/i })).not.toHaveAttribute("src", initialSource);
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.click(screen.getByRole("button", { name: /จำนวนห้องนอน.*เพิ่ม/ }));
  expect(screen.getByText(/^พื้นที่ใช้สอย 178/)).toHaveTextContent("(แนะนำ)");
  await user.click(screen.getByRole("button", { name: "ย้อนกลับ" }));

  expect(screen.getByRole("radio", { name: "Modern Tropical Resort" })).toBeChecked();
});

test("renders the architectural planning stage from the current style", async () => {
  const { user } = renderConfigurator();
  const preview = screen.getByRole("complementary", { name: "พื้นที่แสดงแบบบ้าน" });

  await user.click(screen.getByRole("radio", { name: "Modern Tropical Resort" }));

  expect(within(preview).getByRole("heading", { name: "ทรอปิคอล รีสอร์ต" })).toBeInTheDocument();
  expect(within(preview).getByText("200–300 ตร.ม.")).toBeInTheDocument();
  expect(within(preview).getByText("ครอบครัวที่ชอบธรรมชาติ")).toBeInTheDocument();
  expect(within(preview).getByRole("img", { name: /Modern Tropical Resort/i })).toBeInTheDocument();
  expect(within(preview).getByText("ภาพ Mockup สำหรับวางแผนเบื้องต้น ไม่ใช่แบบก่อสร้าง")).toBeInTheDocument();
});

test("exposes ordered progress, named counter controls, accessible choice groups, and responsive layout semantics", async () => {
  const { user } = renderConfigurator();
  const progress = screen.getByRole("list", { name: "ขั้นตอนการออกแบบบ้าน" });

  expect(within(progress).getAllByRole("listitem")).toHaveLength(5);
  expect(screen.getByTestId("configurator-layout")).toHaveAttribute("data-responsive-layout", "split-preview");
  expect(screen.getByRole("radio", { name: "Contemporary Warm Luxury" })).toBeInTheDocument();

  await chooseStyleAndContinue(user);

  expect(screen.getByRole("spinbutton", { name: "จำนวนชั้น" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /จำนวนชั้น.*ลด/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /จำนวนชั้น.*เพิ่ม/ })).toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: "ห้องทำงาน" })).toBeInTheDocument();
});

test("uses the selected usable-area override and site access in the review summary", async () => {
  const { user } = renderConfigurator();
  await chooseStyleAndContinue(user);
  await user.clear(screen.getByLabelText(/พื้นที่ใช้สอยที่ต้องการ/));
  await user.type(screen.getByLabelText(/พื้นที่ใช้สอยที่ต้องการ/), "220");
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.selectOptions(screen.getByLabelText("จังหวัด"), "10");
  await user.selectOptions(screen.getByLabelText("สภาพการเข้าถึงหน้างาน"), "restricted");
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));

  expect(screen.getByText(/พื้นที่ใช้สอยที่เลือก 220 ตร.ม./)).toBeInTheDocument();
  expect(screen.getByText(/พื้นที่ก่อสร้างรวม.*254/)).toBeInTheDocument();
  expect(screen.getByText(/เข้าถึงได้จำกัด/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "แก้ไขพื้นที่ใช้สอย" }));
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

test("keeps a temporary reversed budget out of the draft and describes the linked correction", async () => {
  const { store, user } = renderConfigurator();
  await chooseStyleAndContinue(user);
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));

  const minimum = screen.getByRole("spinbutton", { name: /เริ่มต้น/ });
  const maximum = screen.getByRole("spinbutton", { name: /สูงสุด/ });
  await user.type(minimum, "9000000");
  await user.type(maximum, "5000000");

  expect(screen.getByText("งบประมาณสูงสุดต้องไม่น้อยกว่างบเริ่มต้น")).toHaveAttribute("id", "budget-error");
  expect(minimum).toHaveAttribute("aria-describedby", "budget-error");
  expect(maximum).toHaveAttribute("aria-describedby", "budget-error");
  expect(store.getState().configuration.targetBudget).toBeNull();
});

test("requires a complete ordered budget before continuing and supports explicitly clearing it", async () => {
  const { store, user } = renderConfigurator();
  await chooseStyleAndContinue(user);
  await user.click(screen.getByRole("button", { name: "ถัดไป" }));
  await user.selectOptions(screen.getByLabelText("จังหวัด"), "10");

  const minimum = screen.getByRole("spinbutton", { name: /เริ่มต้น/ });
  const maximum = screen.getByRole("spinbutton", { name: /สูงสุด/ });
  const next = screen.getByRole("button", { name: "ถัดไป" });

  await user.type(minimum, "5000000");
  expect(next).toBeDisabled();
  expect(screen.getByText("กรอกงบประมาณทั้งสองช่อง หรือเว้นว่างทั้งคู่")).toHaveAttribute("id", "budget-error");
  expect(minimum).toHaveAttribute("aria-describedby", "budget-error");
  expect(store.getState().configuration.targetBudget).toBeNull();

  await user.type(maximum, "7000000");
  expect(next).toBeEnabled();
  expect(store.getState().configuration.targetBudget).toEqual({ min: 5000000, max: 7000000 });

  await user.clear(maximum);
  await user.type(maximum, "4000000");
  expect(next).toBeDisabled();
  expect(screen.getByText("งบประมาณสูงสุดต้องไม่น้อยกว่างบเริ่มต้น")).toHaveAttribute("id", "budget-error");
  expect(store.getState().configuration.targetBudget).toBeNull();

  await user.clear(minimum);
  await user.clear(maximum);
  expect(next).toBeEnabled();
  expect(store.getState().configuration.targetBudget).toBeNull();
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

test("supports arrow-key material selection and blocks preview for an incomplete restored review", async () => {
  const store = createConfiguratorStore(createMemoryDraftStorage(), 0);
  store.getState().setCurrentStep(4);
  const onPreview = vi.fn();
  const user = userEvent.setup();
  render(<ConfiguratorShell onPreview={onPreview} store={store} />);

  await user.click(screen.getByRole("button", { name: "ดู Preview" }));
  expect(onPreview).not.toHaveBeenCalled();
  expect(screen.getByRole("heading", { name: "เลือกรูปแบบบ้าน" })).toHaveFocus();

  await act(async () => {
    store.getState().updateConfiguration({ styleId: "contemporary-warm-luxury", provinceCode: "10" });
    store.getState().setCurrentStep(3);
  });
  const premium = screen.getByRole("radio", { name: /Premium/ });
  premium.focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: /Signature/ })).toHaveAttribute("aria-checked", "true");
  await user.keyboard("{ArrowLeft}");
  expect(screen.getByRole("radio", { name: /Premium/ })).toHaveAttribute("aria-checked", "true");
  await user.keyboard("{ArrowUp}");
  expect(screen.getByRole("radio", { name: /Select/ })).toHaveAttribute("aria-checked", "true");
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("radio", { name: /Premium/ })).toHaveAttribute("aria-checked", "true");
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

test("marks preview data, material boards, and mobile-safe landmarks for the active selection", async () => {
  const { store } = renderConfigurator();

  const preview = screen.getByRole("complementary", { name: "พื้นที่แสดงแบบบ้าน" });
  const form = screen.getByRole("region", { name: "เลือกรูปแบบบ้าน" });
  expect(preview).toHaveAttribute("data-preview-style", "contemporary-warm-luxury");
  expect(preview).toHaveAttribute("data-preview-material", "premium");
  expect(preview).toHaveAttribute("data-mobile-preview-ratio", "16:10");
  expect(form).toHaveAttribute("data-choice-canvas", "true");

  await act(async () => {
    store.getState().setCurrentStep(3);
  });

  const premium = screen.getByRole("radio", { name: /Premium/ });
  expect(premium).toHaveAttribute("data-material-board", "premium");
  expect(within(premium).getAllByTestId("material-swatch")).toHaveLength(3);
  expect(within(premium).getByText("ผนัง")).toBeInTheDocument();
  expect(within(premium).getByText("ไม้")).toBeInTheDocument();
  expect(within(premium).getByText("โลหะและกระจก")).toBeInTheDocument();
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
  expect(within(preview).getByRole("img", { name: /Contemporary Warm Luxury/i }).parentElement).toHaveAttribute("data-preview-tone", "signature");
});

test("explains how function and special-feature choices affect the planning brief without showing prices", async () => {
  const { store } = renderConfigurator();

  await act(async () => {
    store.getState().setCurrentStep(1);
  });
  expect(screen.getByText("มีผลต่อพื้นที่ใช้สอยที่แนะนำ")).toBeInTheDocument();

  await act(async () => {
    store.getState().setCurrentStep(3);
  });
  expect(screen.getByText("มีผลต่อ allowance และหมวดงบประมาณ")).toBeInTheDocument();
});
