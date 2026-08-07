import { z } from "zod";
import {
  HouseConfigurationSchema,
  type HouseConfiguration,
} from "../domain/configuration";

const STORAGE_KEY = "ksb-configurator-draft-v1";

const DraftEnvelopeSchema = z
  .object({
    draftVersion: z.literal(1),
    currentStep: z.number().int().min(0).max(4),
    configuration: HouseConfigurationSchema,
  })
  .strict();

export type DraftEnvelope = z.infer<typeof DraftEnvelopeSchema>;
export type DraftLoadResult =
  | { status: "none" }
  | { status: "valid"; draft: DraftEnvelope }
  | { status: "incompatible" }
  | { status: "unavailable"; operation: "read" };
export type DraftSaveResult =
  | { status: "saved" }
  | { status: "invalid" }
  | { status: "unavailable"; operation: "write" };
export type DraftClearResult =
  | { status: "cleared" }
  | { status: "unavailable"; operation: "clear" };

export type DraftStorage = {
  load(): DraftLoadResult;
  save(currentStep: number, configuration: HouseConfiguration): DraftSaveResult;
  clear(): DraftClearResult;
};

type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createDraftStorage(storage: KeyValueStorage): DraftStorage {
  return {
    load(): DraftLoadResult {
      let raw: string | null;
      try {
        raw = storage.getItem(STORAGE_KEY);
      } catch {
        return { status: "unavailable", operation: "read" };
      }
      if (raw === null) return { status: "none" };

      try {
        const parsed = DraftEnvelopeSchema.safeParse(JSON.parse(raw));
        return parsed.success
          ? { status: "valid", draft: parsed.data }
          : { status: "incompatible" };
      } catch {
        return { status: "incompatible" };
      }
    },
    save(currentStep: number, configuration: HouseConfiguration): DraftSaveResult {
      const parsed = DraftEnvelopeSchema.safeParse({
        draftVersion: 1,
        currentStep,
        configuration,
      });
      if (!parsed.success) return { status: "invalid" };

      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(parsed.data));
        return { status: "saved" };
      } catch {
        return { status: "unavailable", operation: "write" };
      }
    },
    clear(): DraftClearResult {
      try {
        storage.removeItem(STORAGE_KEY);
        return { status: "cleared" };
      } catch {
        return { status: "unavailable", operation: "clear" };
      }
    },
  };
}
