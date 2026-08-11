import { render, screen } from "@testing-library/react";
import { HouseShowcase } from "./house-showcase";
import { getLandingContent } from "./landing-content";

test("treats the one-column tablet layout as a full-width responsive image", () => {
  const showcase = getLandingContent("th").showcase;
  render(<HouseShowcase showcase={showcase} />);

  expect(screen.getByRole("img", { name: showcase.imageAlt })).toHaveAttribute(
    "sizes",
    "(max-width: 1023px) 100vw, 60vw",
  );
});
