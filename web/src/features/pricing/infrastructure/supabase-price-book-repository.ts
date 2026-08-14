import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { PRICING_SPECIAL_FEATURE_CODES } from "@/features/configurator/domain/material-catalog";
import { THAI_PROVINCE_CODES } from "@/features/configurator/domain/provinces";
import type { AreaCatalog } from "@/features/area-planning/domain/area-catalog";
import type { PriceBook } from "../domain/price-book";
import type { PriceBookRepository } from "../application/estimate-project";

type Result = { data: unknown; error: unknown };
type QueryClient = { from(table: "price_books" | "price_book_entries"): { select(columns: string): { eq(column: string, value: string): Promise<Result> } } };
const number = z.number().finite().nonnegative();
const range = z.object({ low: number.int(), expected: number.int(), high: number.int() }).strict().refine((v) => v.low <= v.expected && v.expected <= v.high);
const factor = z.object({ value: number }).strict();
const rateRange = z.object({ low: number.max(1), expected: number.max(1), high: number.max(1) }).strict().refine((v) => v.low <= v.expected && v.expected <= v.high);
const metadata = z.object({ id: z.string().min(1), version: z.string().min(1), status: z.literal("published"), reference_date: z.string().min(1) }).strict();
const entry = z.object({ entry_type: z.enum(["province-rate", "material-factor", "floor-factor", "site-access-factor", "site-risk", "feature-allowance", "design-fee-rates", "tax-rate", "area-catalog"]), entry_key: z.string().min(1), payload: z.unknown(), source_label: z.string().min(1) }).strict();
const areaCatalog = z.object({ bedroomM2: number, bathroomM2: number, livingDiningBaseM2: number, livingDiningPerResidentM2: number, entryStorageM2: number, kitchenM2: number, serviceM2: number, circulationPerFloorM2: number, officeM2: number, elderlyRoomM2: number, thaiKitchenM2: number, multipurposeRoomM2: number, coveredParkingPerSpaceM2: number, coveredServiceM2: number }).strict();
const materialKeys = ["select", "premium", "signature"] as const;
const floorKeys = ["1", "2", "3"] as const;
const accessKeys = ["normal", "restricted", "very-restricted"] as const;

function parseEntries(rows: unknown[], book: z.infer<typeof metadata>): { priceBookId: string; priceBook: PriceBook; areaCatalog: AreaCatalog } {
  const parsed = z.array(entry).safeParse(rows);
  if (!parsed.success) throw new Error("INVALID_PUBLISHED_PRICE_BOOK");
  const map = new Map<string, z.infer<typeof entry>>();
  for (const item of parsed.data) { const key = `${item.entry_type}:${item.entry_key}`; if (map.has(key)) throw new Error("INVALID_PUBLISHED_PRICE_BOOK"); map.set(key, item); }
  const get = (type: z.infer<typeof entry>["entry_type"], key: string) => { const item = map.get(`${type}:${key}`); if (!item) throw new Error("INVALID_PUBLISHED_PRICE_BOOK"); return item.payload; };
  const known = new Set<string>();
  const take = (type: z.infer<typeof entry>["entry_type"], key: string) => { known.add(`${type}:${key}`); return get(type, key); };
  const provinceRates: Record<string, PriceBook["provinceRates"][string]> = {};
  const provinceEntries = parsed.data.filter((row) => row.entry_type === "province-rate");
  const canonicalProvinceCodes = new Set<string>(THAI_PROVINCE_CODES);
  if (provinceEntries.length !== THAI_PROVINCE_CODES.length) throw new Error("INVALID_PUBLISHED_PRICE_BOOK");
  for (const item of provinceEntries) {
    if (!canonicalProvinceCodes.has(item.entry_key)) throw new Error("INVALID_PUBLISHED_PRICE_BOOK");
    known.add(`province-rate:${item.entry_key}`);
    const value = range.safeParse(item.payload); if (!value.success) throw new Error("INVALID_PUBLISHED_PRICE_BOOK");
    provinceRates[item.entry_key] = value.data;
  }
  if (Object.keys(provinceRates).length !== THAI_PROVINCE_CODES.length) throw new Error("INVALID_PUBLISHED_PRICE_BOOK");
  const factorRecord = (type: z.infer<typeof entry>["entry_type"], keys: readonly string[]) => Object.fromEntries(keys.map((key) => { const value = factor.safeParse(take(type, key)); if (!value.success) throw new Error("INVALID_PUBLISHED_PRICE_BOOK"); return [key, value.data.value]; }));
  const rangeRecord = (type: z.infer<typeof entry>["entry_type"], keys: readonly string[]) => Object.fromEntries(keys.map((key) => { const value = range.safeParse(take(type, key)); if (!value.success) throw new Error("INVALID_PUBLISHED_PRICE_BOOK"); return [key, value.data]; }));
  const materialFactors = factorRecord("material-factor", materialKeys) as PriceBook["materialFactors"];
  const floorFactors = factorRecord("floor-factor", floorKeys) as PriceBook["floorFactors"];
  const siteAccessFactors = factorRecord("site-access-factor", accessKeys) as PriceBook["siteAccessFactors"];
  const siteRisk = rangeRecord("site-risk", accessKeys) as PriceBook["siteRisk"];
  const featureAllowances = rangeRecord("feature-allowance", PRICING_SPECIAL_FEATURE_CODES);
  const designFeeRates = rateRange.safeParse(take("design-fee-rates", "default"));
  const tax = factor.safeParse(take("tax-rate", "default"));
  const approvedArea = areaCatalog.safeParse(take("area-catalog", "default"));
  if (!designFeeRates.success || !tax.success || tax.data.value > 1 || !approvedArea.success || known.size !== map.size) throw new Error("INVALID_PUBLISHED_PRICE_BOOK");
  return { priceBookId: book.id, priceBook: { version: book.version, status: "published", referenceDate: book.reference_date, provinceRates, materialFactors, floorFactors, siteAccessFactors, siteRisk, featureAllowances, designFeeRates: designFeeRates.data, taxRate: tax.data.value }, areaCatalog: approvedArea.data };
}

export class SupabasePriceBookRepository implements PriceBookRepository {
  constructor(private readonly client: QueryClient) {}
  async loadPublished() {
    const books = await this.client.from("price_books").select("id,version,status,reference_date").eq("status", "published");
    if (books.error || !Array.isArray(books.data) || books.data.length !== 1) throw new Error("PUBLISHED_PRICE_BOOK_UNAVAILABLE");
    const book = metadata.safeParse(books.data[0]); if (!book.success) throw new Error("INVALID_PUBLISHED_PRICE_BOOK");
    const entries = await this.client.from("price_book_entries").select("entry_type,entry_key,payload,source_label").eq("price_book_id", book.data.id);
    if (entries.error || !Array.isArray(entries.data)) throw new Error("PUBLISHED_PRICE_BOOK_UNAVAILABLE");
    return parseEntries(entries.data, book.data);
  }
}

export function createSupabasePriceBookRepositoryFromEnvironment(): SupabasePriceBookRepository {
  const url = process.env.SUPABASE_URL; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("PUBLISHED_PRICE_BOOK_UNAVAILABLE");
  return new SupabasePriceBookRepository(createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }) as unknown as QueryClient);
}
