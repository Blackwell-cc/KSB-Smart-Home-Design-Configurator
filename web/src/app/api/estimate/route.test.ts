import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { createDefaultConfiguration } from "@/features/configurator/domain/configuration";
import type { PriceBook } from "@/features/pricing/domain/price-book";
import { qaPriceBook } from "@/features/pricing/fixtures/qa-price-book";
import { createEstimatePostHandler, POST } from "./route";

const configuration = {
  ...createDefaultConfiguration(),
  styleId: "contemporary-warm-luxury",
  provinceCode: "10",
};
const validConfiguration = {
  styleId: configuration.styleId,
  residents: configuration.residents,
  floors: configuration.floors,
  bedrooms: configuration.bedrooms,
  bathrooms: configuration.bathrooms,
  parkingSpaces: configuration.parkingSpaces,
  functions: configuration.functions,
  usableAreaOverrideM2: configuration.usableAreaOverrideM2,
  provinceCode: configuration.provinceCode,
  siteAccess: configuration.siteAccess,
  materialLevel: configuration.materialLevel,
  specialFeatures: configuration.specialFeatures,
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

function approvedAreaCatalog() {
  return {
    bedroomM2: 14, bathroomM2: 5, livingDiningBaseM2: 28, livingDiningPerResidentM2: 2,
    entryStorageM2: 8, kitchenM2: 14, serviceM2: 9, circulationPerFloorM2: 20,
    officeM2: 12, elderlyRoomM2: 16, thaiKitchenM2: 12, multipurposeRoomM2: 15,
    coveredParkingPerSpaceM2: 15, coveredServiceM2: 4,
  };
}

function createPublishedHandler(book: PriceBook = publishedPriceBook(), areaCatalog = approvedAreaCatalog()) {
  return createEstimatePostHandler({
    priceBookRepository: { loadPublished: async () => ({ priceBookId: "test-book", priceBook: book, areaCatalog }) },
  });
}

describe("POST /api/estimate", () => {
  test("returns an allowlisted server-validated preview without private configuration fields", async () => {
    const handler = createPublishedHandler();
    const response = await handler(jsonRequest(validConfiguration));
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
        budgetRange: { low: 5_124_319, high: 7_634_677 },
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
    ["private notes", { privateNotes: "ข้อความธรรมดา" }],
    ["district", { district: "เขตทดสอบ" }],
    ["target budget", { targetBudget: { min: 1, max: 2 } }],
  ])("rejects %s", async (_label, addition) => {
    const response = await createPublishedHandler()(jsonRequest({ ...validConfiguration, ...addition }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: { code: "INVALID_CONFIGURATION" } });
  });

  test("rejects invalid configuration and malformed JSON without exposing validation details", async () => {
    const handler = createPublishedHandler();
    const invalidResponse = await handler(jsonRequest({ ...validConfiguration, styleId: "forged-style" }));
    const malformedResponse = await handler(malformedJsonRequest());

    expect(invalidResponse.status).toBe(400);
    await expect(invalidResponse.json()).resolves.toEqual({ error: { code: "INVALID_CONFIGURATION" } });
    expect(malformedResponse.status).toBe(400);
    await expect(malformedResponse.json()).resolves.toEqual({ error: { code: "INVALID_JSON" } });
  });

  test("rejects non-JSON and oversized bodies before configuration parsing", async () => {
    const handler = createPublishedHandler();
    const wrongType = await handler(new NextRequest("http://localhost/api/estimate", {
      method: "POST", headers: { "content-type": "text/plain" }, body: JSON.stringify(validConfiguration),
    }));
    const oversized = await handler(new NextRequest("http://localhost/api/estimate", {
      method: "POST", headers: { "content-type": "application/json" }, body: "x".repeat(32 * 1024 + 1),
    }));

    expect(wrongType.status).toBe(415);
    await expect(wrongType.json()).resolves.toEqual({ error: { code: "UNSUPPORTED_MEDIA_TYPE" } });
    expect(oversized.status).toBe(413);
    await expect(oversized.json()).resolves.toEqual({ error: { code: "PAYLOAD_TOO_LARGE" } });
  });

  test("returns a safe unavailable response from the default runtime when no published book is configured", async () => {
    const response = await POST(jsonRequest(validConfiguration));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: { code: "ESTIMATE_UNAVAILABLE" } });
  });
});
