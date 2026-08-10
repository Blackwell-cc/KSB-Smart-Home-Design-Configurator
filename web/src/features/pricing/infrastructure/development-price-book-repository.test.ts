import { describe, expect, test, vi } from "vitest";
import { THAI_PROVINCE_CODES } from "@/features/configurator/domain/provinces";
import { developmentDemoPriceBook } from "../fixtures/development-demo-price-book";
import { createRuntimePriceBookRepository } from "./development-price-book-repository";

const areaCatalog = {
  bedroomM2: 14, bathroomM2: 5, livingDiningBaseM2: 28, livingDiningPerResidentM2: 2,
  entryStorageM2: 8, kitchenM2: 14, serviceM2: 9, circulationPerFloorM2: 20,
  officeM2: 12, elderlyRoomM2: 16, thaiKitchenM2: 12, multipurposeRoomM2: 15,
  coveredParkingPerSpaceM2: 15, coveredServiceM2: 4,
};

describe("development estimate price-book repository", () => {
  test("provides a complete non-published 77-province development fixture derived from Bangkok", () => {
    expect(developmentDemoPriceBook.status).not.toBe("published");
    expect(Object.keys(developmentDemoPriceBook.provinceRates).sort()).toEqual([...THAI_PROVINCE_CODES].sort());
    expect(developmentDemoPriceBook.provinceRates["10"]).toEqual({ low: 23_700, expected: 28_600, high: 33_500 });
    expect(developmentDemoPriceBook.provinceRates["30"].expected).toBeLessThan(developmentDemoPriceBook.provinceRates["10"].expected);
  });

  test("uses a valid Supabase published price book before considering the development fixture", async () => {
    const published = { loadPublished: vi.fn().mockResolvedValue({ priceBookId: "published-book", priceBook: { ...developmentDemoPriceBook, status: "published" as const, version: "approved-v1" }, areaCatalog }) };

    const loaded = await createRuntimePriceBookRepository("development", published).loadPublished();

    expect(loaded.estimateMode).toBe("published");
    expect(loaded.priceBookId).toBe("published-book");
    expect(published.loadPublished).toHaveBeenCalledOnce();
  });

  test("uses the development fixture only outside production when publication is unavailable", async () => {
    const unavailable = { loadPublished: vi.fn().mockRejectedValue(new Error("PUBLISHED_PRICE_BOOK_UNAVAILABLE")) };

    const loaded = await createRuntimePriceBookRepository("test", unavailable).loadPublished();

    expect(loaded.estimateMode).toBe("development-demo");
    expect(loaded.priceBook).toBe(developmentDemoPriceBook);
  });

  test("keeps production fail-closed and never masks an invalid published book", async () => {
    const unavailable = { loadPublished: vi.fn().mockRejectedValue(new Error("PUBLISHED_PRICE_BOOK_UNAVAILABLE")) };
    const invalid = { loadPublished: vi.fn().mockRejectedValue(new Error("INVALID_PUBLISHED_PRICE_BOOK")) };

    await expect(createRuntimePriceBookRepository("production", unavailable).loadPublished()).rejects.toThrow("PUBLISHED_PRICE_BOOK_UNAVAILABLE");
    await expect(createRuntimePriceBookRepository("development", invalid).loadPublished()).rejects.toThrow("INVALID_PUBLISHED_PRICE_BOOK");
  });
});
