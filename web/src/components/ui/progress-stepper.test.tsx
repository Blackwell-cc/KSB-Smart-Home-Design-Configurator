import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ProgressStepper } from "./progress-stepper";

const STEPS = [
  { id: "style", label: "สไตล์บ้าน" },
  { id: "functions", label: "พื้นที่และฟังก์ชัน" },
  { id: "site", label: "ทำเล" },
] as const;

const scrollIntoView = vi.fn();
const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  scrollIntoView.mockReset();
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === "(max-width: 899px)",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

test("brings the current mobile step into view when the active step changes", () => {
  const { rerender } = render(<ProgressStepper currentStep={0} steps={STEPS} />);
  scrollIntoView.mockClear();

  rerender(<ProgressStepper currentStep={2} steps={STEPS} />);

  expect(screen.getAllByRole("listitem")[2]).toHaveAttribute("aria-current", "step");
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "nearest", inline: "center" });
});
