import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
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

  expect(screen.getByRole("heading", { name: "เลือกสไตล์บ้าน" })).toBeInTheDocument();
  expect(screen.queryByLabelText(/เบอร์โทร|อีเมล|LINE/i)).not.toBeInTheDocument();

  await continueToReview(user);

  expect(screen.getByRole("heading", { name: "ตรวจทานความต้องการ" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "ดู Preview" }));
  expect(onPreview).toHaveBeenCalledWith("/preview");
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
  expect(screen.getByText(/พื้นที่ใช้งานแนะนำ/)).toHaveTextContent("178");
  await user.click(screen.getByRole("button", { name: "ย้อนกลับ" }));

  expect(screen.getByRole("radio", { name: "Modern Tropical Resort" })).toBeChecked();
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
