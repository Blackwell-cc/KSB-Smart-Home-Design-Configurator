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

    drafts.save(3, configuration);

    expect(drafts.load()).toEqual({
      status: "valid",
      draft: {
        draftVersion: 1,
        currentStep: 3,
        configuration,
      },
    });
  });

  test("treats malformed, incompatible, and contact-bearing saved data as incompatible", () => {
    for (const raw of [
      "{not-json",
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

  test("refuses invalid configuration or steps before any data is stored", () => {
    const storage = createMemoryStorage();
    const drafts = createDraftStorage(storage);

    expect(() =>
      drafts.save(5, createDefaultConfiguration()),
    ).toThrow();
    expect(() =>
      drafts.save(1, { ...createDefaultConfiguration(), email: "champ@example.com" } as never),
    ).toThrow();
    expect(storage.readOnlyValue("ksb-configurator-draft-v1")).toBeUndefined();
  });

  test("clears the persisted draft", () => {
    const storage = createMemoryStorage();
    const drafts = createDraftStorage(storage);

    drafts.save(0, createDefaultConfiguration());
    drafts.clear();

    expect(drafts.load()).toEqual({ status: "none" });
  });
});
