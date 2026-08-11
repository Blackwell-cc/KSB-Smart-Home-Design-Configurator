import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createDefaultConfiguration } from "@/features/configurator/domain/configuration";
import { qaPriceBook } from "../fixtures/qa-price-book";
import { estimateProject } from "./estimate-project";
import { projectEstimateRequest } from "./estimate-request";

test("uses the approved area catalog supplied with the published price book instead of QA defaults", async () => {
  const areaCatalog = {
    bedroomM2: 20, bathroomM2: 5, livingDiningBaseM2: 28, livingDiningPerResidentM2: 2,
    entryStorageM2: 8, kitchenM2: 14, serviceM2: 9, circulationPerFloorM2: 20,
    officeM2: 12, elderlyRoomM2: 16, thaiKitchenM2: 12, multipurposeRoomM2: 15,
    coveredParkingPerSpaceM2: 15, coveredServiceM2: 4,
  };
  const configuration = projectEstimateRequest({ ...createDefaultConfiguration(), styleId: "contemporary-warm-luxury", provinceCode: "10" });

  const preview = await estimateProject(configuration, {
    loadPublished: async () => ({ priceBookId: "test-book", priceBook: { ...qaPriceBook, status: "published" }, areaCatalog }),
  });

  expect(preview.usableAreaM2).toBe(182);
  expect(preview.constructionFloorAreaM2).toBe(216);
});

test("keeps the production estimation path free from the QA area catalog", () => {
  const applicationSource = readFileSync(path.join(__dirname, "estimate-project.ts"), "utf8");
  const areaSource = readFileSync(path.join(__dirname, "../../area-planning/domain/calculate-area.ts"), "utf8");

  expect(applicationSource).not.toContain("QA_AREA_CATALOG");
  expect(areaSource).not.toContain("QA_AREA_CATALOG");
});

test("maps placeholder presentation styles to an approved pricing style", () => {
  const request = projectEstimateRequest({
    ...createDefaultConfiguration(),
    styleId: "minimal-nordic",
    provinceCode: "10",
  });

  expect(request.styleId).toBe("contemporary-warm-luxury");
});
