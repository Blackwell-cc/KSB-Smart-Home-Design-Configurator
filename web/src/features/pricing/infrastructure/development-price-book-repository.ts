import type { PriceBookRepository } from "../application/estimate-project";
import { developmentDemoAreaCatalog, developmentDemoPriceBook } from "../fixtures/development-demo-price-book";
import { createSupabasePriceBookRepositoryFromEnvironment } from "./supabase-price-book-repository";

const PUBLISHED_UNAVAILABLE = "PUBLISHED_PRICE_BOOK_UNAVAILABLE";

export function createRuntimePriceBookRepository(
  environment: string | undefined = process.env.NODE_ENV,
  publishedRepository?: PriceBookRepository,
): PriceBookRepository {
  return {
    async loadPublished() {
      try {
        const published = await (publishedRepository ?? createSupabasePriceBookRepositoryFromEnvironment()).loadPublished();
        return { ...published, estimateMode: "published" as const };
      } catch (error) {
        if (environment === "production" || !(error instanceof Error) || error.message !== PUBLISHED_UNAVAILABLE) throw error;
        return {
          priceBookId: "development-demo-price-book",
          priceBook: developmentDemoPriceBook,
          areaCatalog: developmentDemoAreaCatalog,
          estimateMode: "development-demo" as const,
        };
      }
    },
  };
}
