import { calculateArea } from "@/features/area-planning/domain/calculate-area";
import type { HouseConfiguration } from "@/features/configurator/domain/configuration";
import { buildFreePreview, type FreePreviewPayload } from "@/features/preview/application/build-free-preview";
import { calculateEstimate } from "../domain/calculate-estimate";
import type { PriceBook } from "../domain/price-book";

export type PriceBookRepository = {
  loadPublished(): Promise<PriceBook>;
};

export async function estimateProject(
  configuration: HouseConfiguration,
  priceBookRepository: PriceBookRepository,
): Promise<FreePreviewPayload> {
  if (configuration.styleId === null || configuration.provinceCode === null) {
    throw new Error("CONFIGURATION_NOT_READY");
  }

  const area = calculateArea(configuration);
  const priceBook = await priceBookRepository.loadPublished();
  const estimate = calculateEstimate({
    configuration,
    constructionFloorAreaM2: area.constructionFloorAreaM2,
    production: true,
  }, priceBook);

  return buildFreePreview(configuration, area, estimate);
}
