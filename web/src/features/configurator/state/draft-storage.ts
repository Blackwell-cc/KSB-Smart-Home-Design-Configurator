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
  | { status: "incompatible" };

export type DraftStorage = {
  load(): DraftLoadResult;
  save(currentStep: number, configuration: HouseConfiguration): void;
  clear(): void;
};

type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createDraftStorage(storage: KeyValueStorage): DraftStorage {
  return {
    load(): DraftLoadResult {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return { status: "none" };

      try {
        const parsed = DraftEnvelopeSchema.safeParse(JSON.parse(raw));
        return parsed.success
          ? { status: "valid", draft: parsed.data }
          : { status: "incompatible" };
      } catch {
        return { status: "incompatible" };
      }
    },
    save(currentStep: number, configuration: HouseConfiguration): void {
      const draft = DraftEnvelopeSchema.parse({
        draftVersion: 1,
        currentStep,
        configuration,
      });
      storage.setItem(STORAGE_KEY, JSON.stringify(draft));
    },
    clear(): void {
      storage.removeItem(STORAGE_KEY);
    },
  };
}
