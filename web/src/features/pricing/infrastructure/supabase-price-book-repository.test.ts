import { describe, expect, test } from "vitest";
import { qaPriceBook } from "../fixtures/qa-price-book";
import { THAI_PROVINCE_CODES } from "@/features/configurator/domain/provinces";
import { SupabasePriceBookRepository } from "./supabase-price-book-repository";

const areaCatalog = {
  bedroomM2: 14, bathroomM2: 5, livingDiningBaseM2: 28, livingDiningPerResidentM2: 2,
  entryStorageM2: 8, kitchenM2: 14, serviceM2: 9, circulationPerFloorM2: 20,
  officeM2: 12, elderlyRoomM2: 16, thaiKitchenM2: 12, multipurposeRoomM2: 15,
  coveredParkingPerSpaceM2: 15, coveredServiceM2: 4,
};

function entry(entry_type: string, entry_key: string, payload: unknown) {
  return { entry_type, entry_key, payload, source_label: "approved test source" };
}

function publishedEntries() {
  return [
    ...THAI_PROVINCE_CODES.map((key) => entry("province-rate", key, qaPriceBook.provinceRates["10"])),
    ...Object.entries(qaPriceBook.materialFactors).map(([key, value]) => entry("material-factor", key, { value })),
    ...Object.entries(qaPriceBook.floorFactors).map(([key, value]) => entry("floor-factor", key, { value })),
    ...Object.entries(qaPriceBook.siteAccessFactors).map(([key, value]) => entry("site-access-factor", key, { value })),
    ...Object.entries(qaPriceBook.siteRisk).map(([key, payload]) => entry("site-risk", key, payload)),
    ...Object.entries(qaPriceBook.featureAllowances).map(([key, payload]) => entry("feature-allowance", key, payload)),
    entry("design-fee-rates", "default", qaPriceBook.designFeeRates),
    entry("tax-rate", "default", { value: qaPriceBook.taxRate }),
    entry("area-catalog", "default", areaCatalog),
  ];
}

function repositoryFor(bookRows: unknown[], entryRows: unknown[], error: unknown = null) {
  const client = {
    from: (table: string) => ({
      select: () => ({
        eq: async (column: string, value: string) => {
          if (table === "price_books") {
            expect(column).toBe("status");
            expect(value).toBe("published");
            return { data: bookRows, error };
          }
          expect(table).toBe("price_book_entries");
          expect(column).toBe("price_book_id");
          expect(value).toBe("book-1");
          return { data: entryRows, error };
        },
      }),
    }),
  };
  return new SupabasePriceBookRepository(client);
}

const publishedBook = { id: "book-1", version: qaPriceBook.version, status: "published", reference_date: qaPriceBook.referenceDate };
const completeProvinceRates = Object.fromEntries(THAI_PROVINCE_CODES.map((key) => [key, qaPriceBook.provinceRates["10"]]));

describe("SupabasePriceBookRepository", () => {
  test("loads exactly one published book and its matching approved entries", async () => {
    await expect(repositoryFor([publishedBook], publishedEntries()).loadPublished()).resolves.toEqual({
      priceBookId: "book-1", priceBook: { ...qaPriceBook, status: "published", provinceRates: completeProvinceRates }, areaCatalog,
    });
  });

  test.each([
    ["missing book", [], publishedEntries()],
    ["multiple books", [publishedBook, { ...publishedBook, id: "book-2" }], publishedEntries()],
    ["missing area catalog", [publishedBook], publishedEntries().filter((item) => item.entry_type !== "area-catalog")],
    ["missing canonical province", [publishedBook], publishedEntries().filter((item) => item.entry_key !== "96")],
    ["forged province", [publishedBook], [...publishedEntries(), entry("province-rate", "999", qaPriceBook.provinceRates["10"])]],
    ["duplicate entry", [publishedBook], [...publishedEntries(), entry("tax-rate", "default", { value: 0 })]],
    ["unknown entry", [publishedBook], [...publishedEntries(), entry("made-up", "default", {})]],
  ])("rejects %s safely", async (_label, bookRows, entryRows) => {
    await expect(repositoryFor(bookRows, entryRows).loadPublished()).rejects.toThrow(/PUBLISHED_PRICE_BOOK_UNAVAILABLE|INVALID_PUBLISHED_PRICE_BOOK/);
  });

  test("rejects malformed published entry payloads", async () => {
    const entries = publishedEntries();
    const rate = entries.find((item) => item.entry_type === "province-rate");
    if (!rate) throw new Error("TEST_SETUP_MISSING_RATE");
    rate.payload = { low: 30_000, expected: 20_000, high: 40_000 };
    await expect(repositoryFor([publishedBook], entries).loadPublished()).rejects.toThrow("INVALID_PUBLISHED_PRICE_BOOK");
  });

  test("hides database failures behind an unavailable published-book error", async () => {
    await expect(repositoryFor([], [], { message: "database unavailable" }).loadPublished()).rejects.toThrow(
      "PUBLISHED_PRICE_BOOK_UNAVAILABLE",
    );
  });
});
