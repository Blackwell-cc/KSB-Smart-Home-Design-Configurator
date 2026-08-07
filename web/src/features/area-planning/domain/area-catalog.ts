// QA-only coefficients. They are draft inputs for architect review, not published pricing data.
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
} as const;
