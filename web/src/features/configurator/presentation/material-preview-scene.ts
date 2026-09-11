import {
  CONCEPT_CATALOG,
  VISIBLE_CONCEPT_CATALOG,
  resolveConceptImage,
  type ConceptCatalogEntry,
} from "@/features/preview/domain/concept-catalog";
import type { HouseConfiguration } from "../domain/configuration";
import {
  ORIGINAL_MATERIAL_OPTION_ID,
  type MaterialCategoryId,
  type SpecialFeatureId,
} from "../domain/material-catalog";

export const MATERIAL_LAYER_ORDER = ["wall", "roof", "window", "door"] as const;
export const MATERIAL_PREVIEW_ASSET_VERSION = "20260825-window-door-ai-v1";
export const SPECIAL_FEATURE_PREVIEW_ASSET_VERSION = "20260825-special-features-v4";

const MATERIAL_PREVIEW_ASSET_VERSION_BY_SCENE: Readonly<Record<string, string>> = {
  "classic-1f": "20260828-classic-1f-ai-v2",
  "classic-2f": "20260911-classic-2f-ai-v1",
  "classic-3f": "20260909-classic-3f-ai-v1",
  "contemporary-1f": "20260910-contemporary-base-v3",
  "contemporary-2f": "20260910-contemporary-base-v3",
  "contemporary-3f": "20260910-contemporary-base-v3",
  "tropical-1f": "20260910-tropical-1f-ai-v1",
  "tropical-2f": "20260910-tropical-2f-ai-v1",
  "tropical-3f": "20260911-tropical-3f-ai-v1",
  "loft-1f": "20260827-loft-1f-base-v2",
  "loft-2f": "20260827-loft-2f-ai-v1",
  "loft-3f": "20260827-loft-3f-ai-v1",
  "minimal-1f": "20260827-minimal-1f-ai-v1",
  "minimal-2f": "20260828-minimal-2f-ai-v1",
  "minimal-3f": "20260828-minimal-3f-ai-v1",
};

const VISUAL_SPECIAL_FEATURE_IDS = ["pool", "outdoor-pavilion"] as const;
type VisualSpecialFeatureId = (typeof VISUAL_SPECIAL_FEATURE_IDS)[number];

const DOOR_PREVIEW_ASSET_IDS: Readonly<Record<string, string>> = {
  teak: "metal-frame",
  "engineered-wood": "teak",
  "aluminium-glass": "engineered-wood",
  "metal-frame": "aluminium-glass",
};

export type MaterialPreviewLayer = Readonly<{
  category: MaterialCategoryId;
  optionId: string;
  src: string;
}>;

export type SpecialFeaturePreviewLayer = Readonly<{
  featureId: VisualSpecialFeatureId;
  src: string;
}>;

export type MaterialPreviewScene = Readonly<{
  sceneId: string;
  label: string;
  floors: 1 | 2 | 3;
  baseSrc: string;
  available: boolean;
  layers: readonly MaterialPreviewLayer[];
  featureLayers: readonly SpecialFeaturePreviewLayer[];
}>;

export type MaterialPreviewConfiguration = Pick<
  HouseConfiguration,
  "styleId" | "floors" | "materialSelections" | "specialFeatures"
>;

/**
 * The first production pilot supports the manually reviewed Nordic wall,
 * roof, window, and door masks. Flooring stays in state but is not composited
 * until its generated scenes have been reviewed.
 */
export const AVAILABLE_MATERIAL_PREVIEW_SCENES: ReadonlySet<string> = new Set([
  "classic-1f",
  "classic-2f",
  "classic-3f",
  "contemporary-1f",
  "contemporary-2f",
  "contemporary-3f",
  "tropical-1f",
  "tropical-2f",
  "tropical-3f",
  "loft-1f",
  "loft-2f",
  "loft-3f",
  "modern-1f",
  "modern-2f",
  "modern-3f",
  "minimal-1f",
  "minimal-2f",
  "minimal-3f",
  "nordic-1f",
  "nordic-2f",
  "nordic-3f",
]);

const MATERIAL_LAYERS_BY_SCENE: Readonly<Record<string, readonly MaterialCategoryId[]>> = {
  "classic-1f": ["roof", "window", "door"],
  "classic-2f": ["roof", "window", "door"],
  "classic-3f": ["roof", "window", "door"],
  "contemporary-1f": ["roof", "window", "door"],
  "contemporary-2f": ["roof", "window", "door"],
  "contemporary-3f": ["roof", "window", "door"],
  "loft-1f": ["window", "door"],
  "loft-2f": ["window", "door"],
  "loft-3f": ["window", "door"],
};

function normalizedFloor(floors: number): 1 | 2 | 3 {
  return floors <= 1 ? 1 : floors >= 3 ? 3 : 2;
}

function buildSpecialFeatureLayers(
  selectedFeatures: readonly SpecialFeatureId[],
): readonly SpecialFeaturePreviewLayer[] {
  return VISUAL_SPECIAL_FEATURE_IDS
    .filter((featureId) => selectedFeatures.includes(featureId))
    .map((featureId) => ({
      featureId,
      src: `/material-previews/shared/special-features/${featureId}.png?v=${SPECIAL_FEATURE_PREVIEW_ASSET_VERSION}`,
    }));
}

export function buildMaterialPreviewScene(
  configuration: MaterialPreviewConfiguration,
  availableScenes: ReadonlySet<string> = AVAILABLE_MATERIAL_PREVIEW_SCENES,
): MaterialPreviewScene {
  const concept: ConceptCatalogEntry = CONCEPT_CATALOG.find(({ id }) => id === configuration.styleId)
    ?? VISIBLE_CONCEPT_CATALOG[0];
  const floors = normalizedFloor(configuration.floors);
  const previewKey = concept.materialPreviewKey;
  const sceneId = previewKey ? `${previewKey}-${floors}f` : `${concept.id}-${floors}f`;
  const available = Boolean(previewKey && availableScenes.has(sceneId));
  const featureLayers = buildSpecialFeatureLayers(configuration.specialFeatures);

  if (!available || !previewKey) {
    return {
      sceneId,
      label: concept.englishLabel,
      floors,
      baseSrc: resolveConceptImage(concept, floors),
      available: false,
      layers: [],
      featureLayers,
    };
  }

  const root = `/material-previews/${previewKey}/${floors}f`;
  const assetVersion = MATERIAL_PREVIEW_ASSET_VERSION_BY_SCENE[sceneId]
    ?? MATERIAL_PREVIEW_ASSET_VERSION;
  const versioned = (src: string) => `${src}?v=${assetVersion}`;
  const layerOrder = MATERIAL_LAYERS_BY_SCENE[sceneId] ?? MATERIAL_LAYER_ORDER;
  return {
    sceneId,
    label: concept.englishLabel,
    floors,
    baseSrc: versioned(`${root}/base.webp`),
    available: true,
    featureLayers,
    layers: layerOrder.flatMap((category) => {
      const optionId = configuration.materialSelections[category];
      if (optionId === ORIGINAL_MATERIAL_OPTION_ID) return [];
      const assetOptionId = category === "door"
        ? DOOR_PREVIEW_ASSET_IDS[optionId] ?? optionId
        : optionId;
      return [{
        category,
        optionId,
        src: versioned(`${root}/${category}/${assetOptionId}.webp`),
      }];
    }),
  };
}
