import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { FieldError } from "./field-error";

test("renders a focusable, identifiable alert for field validation", () => {
  const reference = createRef<HTMLParagraphElement>();
  render(<FieldError id="province-error" ref={reference}>โปรดเลือกจังหวัด</FieldError>);

  const alert = screen.getByRole("alert");
  expect(alert).toHaveAttribute("id", "province-error");
  expect(alert).toHaveAttribute("tabindex", "-1");
  expect(alert).toHaveTextContent("โปรดเลือกจังหวัด");
  expect(reference.current).toBe(alert);
});
