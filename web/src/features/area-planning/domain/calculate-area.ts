import type { HouseConfiguration } from "@/features/configurator/domain/configuration";
import { QA_AREA_CATALOG as C } from "./area-catalog";

export type AreaRecommendation = {
  recommendedUsableAreaM2: number;
  usableAreaM2: number;
  constructionFloorAreaM2: number;
  breakdown: Array<{
    code: string;
    rawM2: number;
    weight: number;
    weightedM2: number;
  }>;
};

export function calculateArea(input: HouseConfiguration): AreaRecommendation {
  const recommendedUsableAreaM2 = Math.round(
    input.bedrooms * C.bedroomM2 +
      input.bathrooms * C.bathroomM2 +
      C.livingDiningBaseM2 +
      input.residents * C.livingDiningPerResidentM2 +
      C.entryStorageM2 +
      C.kitchenM2 +
      C.serviceM2 +
      input.floors * C.circulationPerFloorM2 +
      (input.functions.office ? C.officeM2 : 0) +
      (input.functions.elderlyRoom ? C.elderlyRoomM2 : 0) +
      (input.functions.thaiKitchen ? C.thaiKitchenM2 : 0) +
      (input.functions.multipurposeRoom ? C.multipurposeRoomM2 : 0),
  );
  const usableAreaM2 = input.usableAreaOverrideM2 ?? recommendedUsableAreaM2;
  const parkingM2 = input.parkingSpaces * C.coveredParkingPerSpaceM2;
  const breakdown = [
    { code: "usable-area", rawM2: usableAreaM2, weight: 1, weightedM2: usableAreaM2 },
    { code: "covered-parking", rawM2: parkingM2, weight: 1, weightedM2: parkingM2 },
    {
      code: "covered-service",
      rawM2: C.coveredServiceM2,
      weight: 1,
      weightedM2: C.coveredServiceM2,
    },
  ];

  return {
    recommendedUsableAreaM2,
    usableAreaM2,
    constructionFloorAreaM2: breakdown.reduce((sum, item) => sum + item.weightedM2, 0),
    breakdown,
  };
}
