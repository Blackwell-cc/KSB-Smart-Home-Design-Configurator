import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { metadata, PublicShareView } from "./page";

const payload = {
  slug: "public-example-7f3k",
  conceptAssetId: "contemporary-warm-luxury",
  styleLabel: "Contemporary Warm Luxury",
  floors: 2,
  bedrooms: 3,
  bathrooms: 3,
  parkingSpaces: 2,
  usableAreaM2: 164,
} as const;

test("renders only the public allowlist and a configurator CTA", () => {
  const { container } = render(<PublicShareView preview={payload} />);

  expect(screen.getByRole("heading", { name: "Contemporary Warm Luxury" })).toBeVisible();
  expect(screen.getByText("164")).toBeVisible();
  expect(screen.getByText(/2 ชั้น/)).toBeVisible();
  expect(screen.getByText(/3 ห้องนอน/)).toBeVisible();
  expect(screen.getByRole("link", { name: "ลองออกแบบบ้านของคุณ" })).toHaveAttribute("href", "/configurator?source=shared-preview");
  expect(container).not.toHaveTextContent(/ราคา|งบประมาณ|โทร|อีเมล|LINE|ที่อยู่/i);
});

test("keeps user-generated share pages out of search indexes", () => {
  expect(metadata.robots).toEqual({ index: false, follow: false });
});
