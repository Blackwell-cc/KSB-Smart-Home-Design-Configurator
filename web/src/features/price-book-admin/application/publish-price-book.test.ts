import { expect, test, vi } from "vitest";
import { SPECIAL_FEATURE_CODES } from "@/features/configurator/domain/configuration";
import { THAI_PROVINCE_CODES } from "@/features/configurator/domain/provinces";
import { publishPriceBook } from "./publish-price-book";

const allowance = { low: 100_000, expected: 200_000, high: 300_000 };
const approvedDraft = {
  candidateId: "11111111-1111-4111-8111-111111111111",
  version: "TH-2026Q3-1.0",
  referenceDate: "2026-08-01",
  provinceEntries: THAI_PROVINCE_CODES.map((code) => ({ code })),
  materialLevels: ["select", "premium", "signature"],
  specialFeatures: [...SPECIAL_FEATURE_CODES],
  featureAllowances: Object.fromEntries(SPECIAL_FEATURE_CODES.map((code) => [code, allowance])),
  goldenCasesPassed: true,
  approvedBy: "22222222-2222-4222-8222-222222222222",
  approvedAt: "2026-08-07T00:00:00.000Z",
  sources: ["MOC", "REIC", "KSB_CALIBRATION"],
};
const adminContext = { userId: "33333333-3333-4333-8333-333333333333", email: "approver@ksb.test", roles: ["pricing-admin", "pricing-approver"] as const };

test("blocks publish until every governance and pricing readiness gate passes", async () => {
  const publish = vi.fn();
  const incomplete = { ...approvedDraft, provinceEntries: approvedDraft.provinceEntries.slice(1), goldenCasesPassed: false, approvedBy: null, sources: [] };

  await expect(publishPriceBook(incomplete, adminContext, { publish })).rejects.toMatchObject({ code: "PRICE_BOOK_NOT_READY" });
  expect(publish).not.toHaveBeenCalled();
});

test("rejects duplicate provinces, missing material levels, and incomplete feature ranges", async () => {
  const repository = { publish: vi.fn() };
  await expect(publishPriceBook({ ...approvedDraft, provinceEntries: approvedDraft.provinceEntries.map((item, index) => index === 1 ? { code: "10" } : item) }, adminContext, repository)).rejects.toMatchObject({ code: "PRICE_BOOK_NOT_READY" });
  await expect(publishPriceBook({ ...approvedDraft, materialLevels: ["select", "premium"] }, adminContext, repository)).rejects.toMatchObject({ code: "PRICE_BOOK_NOT_READY" });
  await expect(publishPriceBook({ ...approvedDraft, featureAllowances: { ...approvedDraft.featureAllowances, pool: { low: 300, expected: 200, high: 100 } } }, adminContext, repository)).rejects.toMatchObject({ code: "PRICE_BOOK_NOT_READY" });
  expect(repository.publish).not.toHaveBeenCalled();
});

test("requires a pricing approver and publishes through the atomic repository boundary", async () => {
  const repository = { publish: vi.fn().mockResolvedValue({ previousStatus: "retired", publishedStatus: "published" }) };
  await expect(publishPriceBook(approvedDraft, { ...adminContext, roles: ["pricing-admin"] }, repository)).rejects.toMatchObject({ code: "PRICE_BOOK_FORBIDDEN" });

  await expect(publishPriceBook(approvedDraft, adminContext, repository)).resolves.toEqual({ previousStatus: "retired", publishedStatus: "published" });
  expect(repository.publish).toHaveBeenCalledWith({ candidateId: approvedDraft.candidateId, version: approvedDraft.version, actorUserId: adminContext.userId });
});
