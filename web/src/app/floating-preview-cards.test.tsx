import { render, screen } from "@testing-library/react";
import { FloatingPreviewCards } from "./floating-preview-cards";
import { getLandingContent } from "./landing-content";

test("uses each style choice's own image and descriptive alt text", () => {
  const showcase = getLandingContent("th").showcase;
  render(<FloatingPreviewCards showcase={showcase} />);

  for (const choice of showcase.style.choices) {
    const image = screen.getByRole("img", { name: `ตัวอย่างสไตล์ ${choice.label}` });
    expect(image).toHaveAttribute("src", expect.stringContaining(encodeURIComponent(choice.image)));
    expect(image).toHaveAttribute("sizes", "(max-width: 1023px) 30vw, 92px");
  }
});

test("uses a tablet-aware responsive size for the share thumbnail", () => {
  const showcase = getLandingContent("th").showcase;
  render(<FloatingPreviewCards showcase={showcase} />);

  expect(screen.getByRole("img", { name: showcase.share.imageAlt })).toHaveAttribute(
    "sizes",
    "(max-width: 1023px) 52vw, 160px",
  );
});
