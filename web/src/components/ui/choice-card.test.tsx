import { render, screen } from "@testing-library/react";
import { ChoiceCard } from "./choice-card";

test("communicates selected state with a pressed button and visible text", () => {
  render(<ChoiceCard selected title="Contemporary Warm Luxury" />);

  expect(screen.getByRole("button", { name: /Contemporary Warm Luxury เลือกแล้ว/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
