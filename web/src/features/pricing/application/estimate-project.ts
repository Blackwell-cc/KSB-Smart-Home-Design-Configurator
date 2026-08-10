import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import type { AreaCatalog } from "@/features/area-planning/domain/area-catalog";
import { buildFreePreview, type FreePreviewPayload } from "@/features/preview/application/build-free-preview";
import { calculateEstimate } from "../domain/calculate-estimate";
import type { PriceBook } from "../domain/price-book";
import { toCalculationConfiguration, type EstimateRequest } from "./estimate-request";

export type PriceBookRepository = {
  loadPublished(): Promise<{ priceBookId: string; priceBook: PriceBook; areaCatalog: AreaCatalog }>;
};

export async function estimateProject(
  request: EstimateRequest,
  priceBookRepository: PriceBookRepository,
): Promise<FreePreviewPayload> {
  const configuration = toCalculationConfiguration(request);
  const { priceBook, areaCatalog } = await priceBookRepository.loadPublished();
  const area = calculateArea(configuration, areaCatalog);
  const estimate = calculateEstimate({
    configuration,
    constructionFloorAreaM2: area.constructionFloorAreaM2,
    production: true,
  }, priceBook);

  return buildFreePreview(configuration, area, estimate);
}
