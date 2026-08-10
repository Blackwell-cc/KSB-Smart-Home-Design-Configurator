import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { createDefaultConfiguration } from "@/features/configurator/domain/configuration";
import { qaPriceBook } from "@/features/pricing/fixtures/qa-price-book";
import type { PriceBook } from "@/features/pricing/domain/price-book";
import { createEstimatePostHandler, POST } from "./route";

const validConfiguration = {
  ...createDefaultConfiguration(),
  styleId: "contemporary-warm-luxury",
  provinceCode: "10",
};

const jsonRequest = (body: unknown) => new NextRequest("http://localhost/api/estimate", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const malformedJsonRequest = () => new NextRequest("http://localhost/api/estimate", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: "{",
});

function publishedPriceBook(): PriceBook {
  return { ...structuredClone(qaPriceBook), status: "published" };
}

function createPublishedHandler(book: PriceBook = publishedPriceBook()) {
  return createEstimatePostHandler({
    priceBookRepository: { loadPublished: async () => book },
  });
}

describe("POST /api/estimate", () => {
  test("returns an allowlisted server-validated preview without private configuration fields", async () => {
    const handler = createPublishedHandler();
    const response = await handler(jsonRequest({
      ...validConfiguration,
      district: "เขตทดสอบ",
      siteAccess: "restricted",
      privateNotes: "ห้ามส่งออก",
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      preview: expect.objectContaining({
        conceptAssetId: "contemporary-warm-luxury",
        styleLabel: "Contemporary Warm Luxury",
        floors: 2,
        bedrooms: 3,
        bathrooms: 3,
        parkingSpaces: 2,
        usableAreaM2: 164,
        constructionFloorAreaM2: 198,
        materialLevel: "premium",
        budgetRange: { low: 5_429_292, high: 8_284_065 },
        confidence: "C",
        disclaimer: expect.any(String),
      }),
    });
    expect(Object.keys(body.preview).sort()).toEqual([
      "bathrooms",
      "bedrooms",
      "budgetRange",
      "conceptAssetId",
      "confidence",
      "constructionFloorAreaM2",
      "disclaimer",
      "floors",
      "materialLevel",
      "parkingSpaces",
      "styleLabel",
      "usableAreaM2",
    ]);
    expect(JSON.stringify(body)).not.toMatch(/phone|email|lineId|name|district|province|siteAccess|privateNotes|lines|assumptions|included|excluded|pricingVersion|referenceDate/i);
  });

  test("uses deterministic server-side area planning and pricing", async () => {
    const handler = createPublishedHandler();
    const first = await (await handler(jsonRequest(validConfiguration))).json();
    const second = await (await handler(jsonRequest(validConfiguration))).json();

    expect(second).toEqual(first);
    expect(first.preview).toMatchObject({
      usableAreaM2: 164,
      constructionFloorAreaM2: 198,
      budgetRange: { low: 5_124_319, high: 7_634_677 },
    });
  });

  test.each([
    ["client-supplied price", { estimate: { total: 1 } }],
    ["unknown key", { untrusted: true }],
    ["contact data", { email: "person@example.test" }],
  ])("rejects %s", async (_label, addition) => {
    const response = await createPublishedHandler()(jsonRequest({ ...validConfiguration, ...addition }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: { code: "INVALID_CONFIGURATION" } });
  });

  test("rejects invalid configuration and malformed JSON without exposing validation details", async () => {
    const handler = createPublishedHandler();
    const invalidResponse = await handler(jsonRequest({ ...validConfiguration, floors: 9 }));
    const malformedResponse = await handler(malformedJsonRequest());

    expect(invalidResponse.status).toBe(400);
    await expect(invalidResponse.json()).resolves.toEqual({ error: { code: "INVALID_CONFIGURATION" } });
    expect(malformedResponse.status).toBe(400);
    await expect(malformedResponse.json()).resolves.toEqual({ error: { code: "INVALID_JSON" } });
  });

  test("returns a safe unavailable response from the default runtime when no published book is configured", async () => {
    const response = await POST(jsonRequest(validConfiguration));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: { code: "ESTIMATE_UNAVAILABLE" } });
  });
});
