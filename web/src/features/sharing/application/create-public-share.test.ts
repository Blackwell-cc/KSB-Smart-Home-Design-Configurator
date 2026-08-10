import { expect, test, vi } from "vitest";
import { createPublicShare } from "./create-public-share";

const privateProject = {
  id: "11111111-1111-4111-8111-111111111111",
  conceptAssetId: "contemporary-warm-luxury",
  styleLabel: "Contemporary Warm Luxury",
  floors: 2,
  bedrooms: 3,
  bathrooms: 3,
  parkingSpaces: 2,
  usableAreaM2: 164,
  name: "ข้อมูลส่วนตัว",
  phone: "0910000000",
  email: "owner@example.test",
  lineId: "private-line",
  budget: 6_000_000,
  notes: "Private note",
  province: "10",
  privateToken: "secret",
};

test("copies only explicitly public fields into the persisted share and response", async () => {
  const save = vi.fn().mockResolvedValue({ slug: "public-example-7f3k" });

  const payload = await createPublicShare(privateProject, { save }, () => "public-example-7f3k");

  expect(Object.keys(payload).sort()).toEqual([
    "bathrooms", "bedrooms", "conceptAssetId", "floors", "parkingSpaces", "slug", "styleLabel", "usableAreaM2",
  ]);
  expect(JSON.stringify(payload)).not.toMatch(/name|phone|email|lineId|price|budget|notes|province|token/i);
  expect(save).toHaveBeenCalledWith({
    projectId: privateProject.id,
    slug: "public-example-7f3k",
    publicPayload: {
      conceptAssetId: "contemporary-warm-luxury",
      styleLabel: "Contemporary Warm Luxury",
      floors: 2,
      bedrooms: 3,
      bathrooms: 3,
      parkingSpaces: 2,
      usableAreaM2: 164,
    },
  });
});

test("rejects malformed private sources and unsafe repository responses", async () => {
  await expect(createPublicShare({ ...privateProject, usableAreaM2: -1 }, { save: vi.fn() }, () => "public-example-7f3k")).rejects.toThrow("INVALID_PUBLIC_SHARE_SOURCE");
  await expect(createPublicShare(privateProject, { save: vi.fn().mockResolvedValue({ slug: "../private" }) }, () => "public-example-7f3k")).rejects.toThrow("PUBLIC_SHARE_UNAVAILABLE");
});
