import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { PriceBook } from "../domain/price-book";
import type { PriceBookRepository } from "../application/estimate-project";

type SupabaseResult = { data: unknown; error: unknown };

type PublishedPriceBookClient = {
  from(table: "price_books"): {
    select(columns: "*"): {
      eq(column: "status", value: "published"): Promise<SupabaseResult>;
    };
  };
};

const nonNegativeNumber = z.number().finite().nonnegative();
const factor = nonNegativeNumber;
const moneyRange = z.object({
  low: nonNegativeNumber.int(),
  expected: nonNegativeNumber.int(),
  high: nonNegativeNumber.int(),
}).strict().refine((value) => value.low <= value.expected && value.expected <= value.high);
const rateRange = z.object({
  low: nonNegativeNumber.max(1),
  expected: nonNegativeNumber.max(1),
  high: nonNegativeNumber.max(1),
}).strict().refine((value) => value.low <= value.expected && value.expected <= value.high);

const PriceBookSchema = z.object({
  version: z.string().min(1),
  status: z.literal("published"),
  referenceDate: z.string().min(1),
  provinceRates: z.record(z.string(), moneyRange),
  materialFactors: z.object({ select: factor, premium: factor, signature: factor }).strict(),
  floorFactors: z.object({ 1: factor, 2: factor, 3: factor }).strict(),
  siteAccessFactors: z.object({ normal: factor, restricted: factor, "very-restricted": factor }).strict(),
  siteRisk: z.object({ normal: moneyRange, restricted: moneyRange, "very-restricted": moneyRange }).strict(),
  featureAllowances: z.record(z.string(), moneyRange),
  designFeeRates: rateRange,
  taxRate: nonNegativeNumber.max(1),
}).strict();

export class SupabasePriceBookRepository implements PriceBookRepository {
  constructor(private readonly client: PublishedPriceBookClient) {}

  async loadPublished(): Promise<PriceBook> {
    const result = await this.client.from("price_books").select("*").eq("status", "published");
    if (result.error || !Array.isArray(result.data) || result.data.length !== 1) {
      throw new Error("PUBLISHED_PRICE_BOOK_UNAVAILABLE");
    }

    const parsed = PriceBookSchema.safeParse(result.data[0]);
    if (!parsed.success) throw new Error("INVALID_PUBLISHED_PRICE_BOOK");
    return parsed.data;
  }
}

export function createSupabasePriceBookRepositoryFromEnvironment(): SupabasePriceBookRepository {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_PUBLISHED_PRICE_BOOK_ANON_KEY;
  if (!url || !anonKey) throw new Error("PUBLISHED_PRICE_BOOK_UNAVAILABLE");

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return new SupabasePriceBookRepository(client as unknown as PublishedPriceBookClient);
}
