import { describe, expect, test } from "vitest";
import { createDefaultConfiguration } from "../domain/configuration";
import { createDraftStorage } from "./draft-storage";

function createMemoryStorage(initial?: Record<string, string>) {
  const entries = new Map(Object.entries(initial ?? {}));

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
    readOnlyValue: (key: string) => entries.get(key),
  };
}

describe("DraftStorage", () => {
  test("returns none when a draft does not exist", () => {
    const storage = createMemoryStorage();

    expect(createDraftStorage(storage).load()).toEqual({ status: "none" });
  });

  test("saves a versioned valid configuration and loads it after validation", () => {
    const storage = createMemoryStorage();
    const drafts = createDraftStorage(storage);
    const configuration = { ...createDefaultConfiguration(), provinceCode: "10" as const };

    expect(drafts.save(3, configuration)).toEqual({ status: "saved" });

    expect(drafts.load()).toEqual({
      status: "valid",
      draft: {
        draftVersion: 1,
        currentStep: 3,
        configuration,
      },
    });
  });

  test("migrates legacy signature drafts without losing features", () => {
    const legacyConfiguration = { ...createDefaultConfiguration() } as Record<string, unknown>;
    delete legacyConfiguration.materialSelections;
    delete legacyConfiguration.materialQualityId;
    legacyConfiguration.materialLevel = "signature";
    legacyConfiguration.specialFeatures = ["pool"];
    const storage = createMemoryStorage({
      "ksb-configurator-draft-v1": JSON.stringify({
        draftVersion: 1,
        currentStep: 3,
        configuration: legacyConfiguration,
      }),
    });

    const result = createDraftStorage(storage).load();

    expect(result).toMatchObject({
      status: "valid",
      draft: { configuration: { materialQualityId: "signature", specialFeatures: ["pool"] } },
    });
  });

  test("treats malformed, incompatible, and contact-bearing saved data as incompatible", () => {
    for (const raw of [
      "{not-json",
      "",
      JSON.stringify({ draftVersion: 2, currentStep: 0, configuration: createDefaultConfiguration() }),
      JSON.stringify({
        draftVersion: 1,
        currentStep: 5,
        configuration: createDefaultConfiguration(),
      }),
      JSON.stringify({
        draftVersion: 1,
        currentStep: 1,
        configuration: { ...createDefaultConfiguration(), phone: "0919914592" },
      }),
      JSON.stringify({
        draftVersion: 1,
        currentStep: 1,
        configuration: createDefaultConfiguration(),
        lead: { email: "champ@example.com" },
      }),
    ]) {
      const storage = createMemoryStorage({ "ksb-configurator-draft-v1": raw });

      expect(createDraftStorage(storage).load()).toEqual({ status: "incompatible" });
    }
  });

  test("reports unavailable when local storage cannot be read", () => {
    const drafts = createDraftStorage({
      getItem: () => {
        throw new Error("storage read failed");
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    expect(drafts.load()).toEqual({ status: "unavailable", operation: "read" });
  });

  test("reads the draft value once before parsing it", () => {
    let reads = 0;
    const drafts = createDraftStorage({
      getItem: () => {
        reads += 1;
        if (reads > 1) throw new Error("unexpected second read");
        return JSON.stringify({
          draftVersion: 1,
          currentStep: 0,
          configuration: createDefaultConfiguration(),
        });
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    expect(drafts.load()).toMatchObject({ status: "valid" });
  });

  test("returns invalid without storing invalid configuration or steps", () => {
    const storage = createMemoryStorage();
    const drafts = createDraftStorage(storage);

    expect(drafts.save(5, createDefaultConfiguration())).toEqual({ status: "invalid" });
    expect(
      drafts.save(1, { ...createDefaultConfiguration(), email: "champ@example.com" } as never),
    ).toEqual({ status: "invalid" });
    expect(storage.readOnlyValue("ksb-configurator-draft-v1")).toBeUndefined();
  });

  test("reports unavailable without throwing when local storage cannot be written", () => {
    const drafts = createDraftStorage({
      getItem: () => null,
      setItem: () => {
        throw new Error("storage write failed");
      },
      removeItem: () => undefined,
    });

    expect(drafts.save(0, createDefaultConfiguration())).toEqual({
      status: "unavailable",
      operation: "write",
    });
  });

  test("clears the persisted draft", () => {
    const storage = createMemoryStorage();
    const drafts = createDraftStorage(storage);

    drafts.save(0, createDefaultConfiguration());
    expect(drafts.clear()).toEqual({ status: "cleared" });

    expect(drafts.load()).toEqual({ status: "none" });
  });

  test("reports unavailable without throwing when local storage cannot be cleared", () => {
    const drafts = createDraftStorage({
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => {
        throw new Error("storage clear failed");
      },
    });

    expect(drafts.clear()).toEqual({ status: "unavailable", operation: "clear" });
  });
});
