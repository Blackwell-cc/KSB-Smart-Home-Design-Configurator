import { createStore, type StoreApi } from "zustand/vanilla";
import {
  HouseConfigurationSchema,
  createDefaultConfiguration,
  type HouseConfiguration,
} from "../domain/configuration";
import type { DraftLoadResult, DraftStorage } from "./draft-storage";

export const CONFIGURATOR_DRAFT_DEBOUNCE_MS = 300;
export type DraftPersistenceStatus =
  | "idle"
  | "pending"
  | "saved"
  | "cleared"
  | "invalid"
  | "unavailable";

export type ConfiguratorStoreState = {
  configuration: HouseConfiguration;
  currentStep: number;
  draftLoadStatus: DraftLoadResult["status"];
  draftPersistenceStatus: DraftPersistenceStatus;
  setCurrentStep(currentStep: number): void;
  updateConfiguration(patch: Partial<HouseConfiguration>): void;
  flushPendingDraft(): void;
  dispose(): void;
  clearDraftAfterPrivateProjectCreated(): void;
};

function validateCurrentStep(currentStep: number): number {
  if (!Number.isInteger(currentStep) || currentStep < 0 || currentStep > 4) {
    throw new RangeError("Current step must be an integer from 0 to 4.");
  }

  return currentStep;
}

export function createConfiguratorStore(
  draftStorage: DraftStorage,
  debounceMs = CONFIGURATOR_DRAFT_DEBOUNCE_MS,
): StoreApi<ConfiguratorStoreState> {
  const loadedDraft = draftStorage.load();
  const initialState =
    loadedDraft.status === "valid"
      ? {
          configuration: loadedDraft.draft.configuration,
          currentStep: loadedDraft.draft.currentStep,
        }
      : {
          configuration: createDefaultConfiguration(),
          currentStep: 0,
        };
  let pendingSave: ReturnType<typeof setTimeout> | undefined;
  let pendingGeneration = 0;

  return createStore<ConfiguratorStoreState>((set, get) => {
    const saveDraft = () => {
      const { configuration, currentStep } = get();
      try {
        const result = draftStorage.save(currentStep, configuration);
        set({ draftPersistenceStatus: result.status });
      } catch {
        set({ draftPersistenceStatus: "unavailable" });
      }
    };
    const cancelPendingDraft = () => {
      if (pendingSave !== undefined) clearTimeout(pendingSave);
      pendingSave = undefined;
      pendingGeneration += 1;
    };
    const scheduleDraftSave = () => {
      cancelPendingDraft();
      const generation = pendingGeneration;

      const timer = setTimeout(() => {
        if (pendingSave !== timer || generation !== pendingGeneration) return;
        pendingSave = undefined;
        saveDraft();
      }, debounceMs);
      pendingSave = timer;
      set({ draftPersistenceStatus: "pending" });
    };

    return {
      ...initialState,
      draftLoadStatus: loadedDraft.status,
      draftPersistenceStatus: "idle",
      setCurrentStep(currentStep) {
        set({ currentStep: validateCurrentStep(currentStep) });
        scheduleDraftSave();
      },
      updateConfiguration(patch) {
        const configuration = HouseConfigurationSchema.parse({
          ...get().configuration,
          ...patch,
        });
        set({ configuration });
        scheduleDraftSave();
      },
      flushPendingDraft() {
        if (pendingSave === undefined) return;
        cancelPendingDraft();
        saveDraft();
      },
      dispose() {
        cancelPendingDraft();
      },
      clearDraftAfterPrivateProjectCreated() {
        cancelPendingDraft();
        try {
          const result = draftStorage.clear();
          if (result.status === "cleared") {
            set({ draftLoadStatus: "none", draftPersistenceStatus: "cleared" });
            return;
          }
        } catch {
          // Treat a broken implementation like an unavailable browser storage boundary.
        }
        set({ draftPersistenceStatus: "unavailable" });
      },
    };
  });
}
