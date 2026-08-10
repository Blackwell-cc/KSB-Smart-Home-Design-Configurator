export type AreaCatalog = {
  bedroomM2: number; bathroomM2: number; livingDiningBaseM2: number; livingDiningPerResidentM2: number;
  entryStorageM2: number; kitchenM2: number; serviceM2: number; circulationPerFloorM2: number;
  officeM2: number; elderlyRoomM2: number; thaiKitchenM2: number; multipurposeRoomM2: number;
  coveredParkingPerSpaceM2: number; coveredServiceM2: number;
};

// QA-only coefficients. They are draft inputs for architect review, never runtime published data.
export const QA_AREA_CATALOG = {
  status: "draft-for-architect-review" as const,
  bedroomM2: 14,
  bathroomM2: 5,
  livingDiningBaseM2: 28,
  livingDiningPerResidentM2: 2,
  entryStorageM2: 8,
  kitchenM2: 14,
  serviceM2: 9,
  circulationPerFloorM2: 20,
  officeM2: 12,
  elderlyRoomM2: 16,
  thaiKitchenM2: 12,
  multipurposeRoomM2: 15,
  coveredParkingPerSpaceM2: 15,
  coveredServiceM2: 4,
} as const satisfies AreaCatalog & { status: "draft-for-architect-review" };
