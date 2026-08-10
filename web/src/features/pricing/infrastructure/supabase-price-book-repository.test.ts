import { describe, expect, test } from "vitest";
import { qaPriceBook } from "../fixtures/qa-price-book";
import { SupabasePriceBookRepository } from "./supabase-price-book-repository";

function publishedBook() {
  return { ...structuredClone(qaPriceBook), status: "published" as const };
}

function repositoryFor(rows: unknown[], error: unknown = null) {
  const select = () => ({
    eq: async (column: string, value: string) => {
      expect(column).toBe("status");
      expect(value).toBe("published");
      return { data: rows, error };
    },
  });
  const client = { from: (table: string) => {
    expect(table).toBe("price_books");
    return { select };
  } };

  return new SupabasePriceBookRepository(client);
}

describe("SupabasePriceBookRepository", () => {
  test("loads exactly one published price book", async () => {
    await expect(repositoryFor([publishedBook()]).loadPublished()).resolves.toMatchObject({
      status: "published",
      version: qaPriceBook.version,
    });
  });

  test.each([
    ["missing", []],
    ["multiple", [publishedBook(), { ...publishedBook(), version: "TH-OTHER" }]],
  ])("rejects a %s published price-book result", async (_label, rows) => {
    await expect(repositoryFor(rows).loadPublished()).rejects.toThrow("PUBLISHED_PRICE_BOOK_UNAVAILABLE");
  });

  test("rejects malformed runtime price-book data", async () => {
    const invalid = publishedBook();
    invalid.provinceRates = { "10": { low: 50_000, expected: 40_000, high: 60_000 } };

    await expect(repositoryFor([invalid]).loadPublished()).rejects.toThrow("INVALID_PUBLISHED_PRICE_BOOK");
  });

  test("hides database failures behind an unavailable published-book error", async () => {
    await expect(repositoryFor([], { message: "database unavailable" }).loadPublished()).rejects.toThrow(
      "PUBLISHED_PRICE_BOOK_UNAVAILABLE",
    );
  });
});
