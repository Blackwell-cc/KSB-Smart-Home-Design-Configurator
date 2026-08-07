import { afterEach, describe, expect, test, vi } from "vitest";
import { createDefaultConfiguration } from "../domain/configuration";
import type {
  DraftClearResult,
  DraftLoadResult,
  DraftSaveResult,
  DraftStorage,
} from "./draft-storage";
import { createDraftStorage } from "./draft-storage";
import {
  CONFIGURATOR_DRAFT_DEBOUNCE_MS,
  createConfiguratorStore,
} from "./configurator-store";

function createDraftStorageSpy(
  loadResult: DraftLoadResult = { status: "none" },
  results: { save?: DraftSaveResult; clear?: DraftClearResult } = {},
) {
  const saveResult = results.save ?? { status: "saved" };
  const clearResult = results.clear ?? { status: "cleared" };

  return {
    load: vi.fn(() => loadResult),
    save: vi.fn(() => saveResult),
    clear: vi.fn(() => clearResult),
  } satisfies DraftStorage;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("ConfiguratorStore", () => {
  test("restores a validated draft configuration and its current step", () => {
    const configuration = { ...createDefaultConfiguration(), residents: 5, provinceCode: "10" as const };
    const drafts = createDraftStorageSpy({
      status: "valid",
      draft: { draftVersion: 1, currentStep: 3, configuration },
    });

    const store = createConfiguratorStore(drafts);

    expect(store.getState()).toMatchObject({
      configuration,
      currentStep: 3,
      draftLoadStatus: "valid",
    });
  });

  test("starts from a safe default when a loaded draft is incompatible", () => {
    const store = createConfiguratorStore(createDraftStorageSpy({ status: "incompatible" }));

    expect(store.getState()).toMatchObject({
      configuration: createDefaultConfiguration(),
      currentStep: 0,
      draftLoadStatus: "incompatible",
    });
  });

  test("starts from a safe default and exposes an unavailable read status", () => {
    const store = createConfiguratorStore(
      createDraftStorageSpy({ status: "unavailable", operation: "read" }),
    );

    expect(store.getState()).toMatchObject({
      configuration: createDefaultConfiguration(),
      currentStep: 0,
      draftLoadStatus: "unavailable",
      draftPersistenceStatus: "idle",
    });
  });

  test("debounces draft persistence and saves the latest validated state", () => {
    vi.useFakeTimers();
    const drafts = createDraftStorageSpy();
    const store = createConfiguratorStore(drafts);

    store.getState().setCurrentStep(1);
    store.getState().updateConfiguration({ residents: 5 });
    store.getState().setCurrentStep(2);

    vi.advanceTimersByTime(CONFIGURATOR_DRAFT_DEBOUNCE_MS - 1);
    expect(drafts.save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(drafts.save).toHaveBeenCalledTimes(1);
    expect(drafts.save).toHaveBeenCalledWith(2, {
      ...createDefaultConfiguration(),
      residents: 5,
    });
    expect(store.getState().draftPersistenceStatus).toBe("saved");
  });

  test("flushes the latest real storage draft before debounce expiry and cancels the stale timer", () => {
    vi.useFakeTimers();
    const records = new Map<string, string>();
    const setItem = vi.fn((key: string, value: string) => records.set(key, value));
    const storage = createDraftStorage({
      getItem: (key) => records.get(key) ?? null,
      setItem,
      removeItem: (key) => records.delete(key),
    });
    const store = createConfiguratorStore(storage);

    store.getState().updateConfiguration({ residents: 6 });
    store.getState().setCurrentStep(1);
    store.getState().flushPendingDraft();
    store.getState().dispose();
    vi.advanceTimersByTime(CONFIGURATOR_DRAFT_DEBOUNCE_MS);

    const restored = createConfiguratorStore(storage).getState();
    expect(restored.configuration.residents).toBe(6);
    expect(restored.currentStep).toBe(1);
    expect(setItem).toHaveBeenCalledTimes(1);
  });

  test("does not create a draft when flush and dispose run without a pending edit", () => {
    vi.useFakeTimers();
    const records = new Map<string, string>();
    const storage = createDraftStorage({
      getItem: (key) => records.get(key) ?? null,
      setItem: (key, value) => records.set(key, value),
      removeItem: (key) => records.delete(key),
    });
    const store = createConfiguratorStore(storage);

    store.getState().flushPendingDraft();
    store.getState().dispose();
    vi.advanceTimersByTime(CONFIGURATOR_DRAFT_DEBOUNCE_MS);

    expect(createConfiguratorStore(storage).getState().draftLoadStatus).toBe("none");
  });

  test("clearing a draft prevents a pending save from being recreated during flush or disposal", () => {
    vi.useFakeTimers();
    const records = new Map<string, string>();
    const storage = createDraftStorage({
      getItem: (key) => records.get(key) ?? null,
      setItem: (key, value) => records.set(key, value),
      removeItem: (key) => records.delete(key),
    });
    const store = createConfiguratorStore(storage);

    store.getState().setCurrentStep(1);
    store.getState().clearDraftAfterPrivateProjectCreated();
    store.getState().flushPendingDraft();
    store.getState().dispose();
    vi.advanceTimersByTime(CONFIGURATOR_DRAFT_DEBOUNCE_MS);

    expect(createConfiguratorStore(storage).getState().draftLoadStatus).toBe("none");
  });

  test("keeps configuration in memory and exposes an unavailable status when persistence fails", () => {
    vi.useFakeTimers();
    const drafts = createDraftStorageSpy(
      { status: "none" },
      { save: { status: "unavailable", operation: "write" } },
    );
    const store = createConfiguratorStore(drafts);

    store.getState().updateConfiguration({ residents: 5 });
    vi.runAllTimers();

    expect(store.getState()).toMatchObject({
      configuration: { ...createDefaultConfiguration(), residents: 5 },
      draftPersistenceStatus: "unavailable",
    });
  });

  test("maps a real local-storage write failure to a non-PII persistence status", () => {
    vi.useFakeTimers();
    const store = createConfiguratorStore(
      createDraftStorage({
        getItem: () => null,
        setItem: () => {
          throw new Error("storage write failed");
        },
        removeItem: () => undefined,
      }),
    );

    store.getState().updateConfiguration({ residents: 5 });
    vi.runAllTimers();

    expect(store.getState()).toMatchObject({
      configuration: { ...createDefaultConfiguration(), residents: 5 },
      draftPersistenceStatus: "unavailable",
    });
  });

  test("rejects invalid or contact-bearing updates before they can be persisted", () => {
    vi.useFakeTimers();
    const drafts = createDraftStorageSpy();
    const store = createConfiguratorStore(drafts);

    expect(() => store.getState().updateConfiguration({ residents: 0 })).toThrow();
    expect(() =>
      store.getState().updateConfiguration({ email: "champ@example.com" } as never),
    ).toThrow();

    vi.runAllTimers();
    expect(drafts.save).not.toHaveBeenCalled();
  });

  test("clears the pending and saved draft only after private project creation is confirmed", () => {
    vi.useFakeTimers();
    const drafts = createDraftStorageSpy();
    const store = createConfiguratorStore(drafts);

    store.getState().setCurrentStep(1);
    store.getState().clearDraftAfterPrivateProjectCreated();
    vi.runAllTimers();

    expect(drafts.clear).toHaveBeenCalledTimes(1);
    expect(drafts.save).not.toHaveBeenCalled();
    expect(store.getState()).toMatchObject({
      configuration: createDefaultConfiguration(),
      draftLoadStatus: "none",
      draftPersistenceStatus: "cleared",
    });
  });

  test("cancels persistence and never claims a draft was cleared when physical removal fails", () => {
    vi.useFakeTimers();
    const configuration = { ...createDefaultConfiguration(), residents: 5 };
    const drafts = createDraftStorageSpy(
      {
        status: "valid",
        draft: { draftVersion: 1, currentStep: 1, configuration },
      },
      { clear: { status: "unavailable", operation: "clear" } },
    );
    const store = createConfiguratorStore(drafts);

    store.getState().setCurrentStep(2);
    store.getState().clearDraftAfterPrivateProjectCreated();
    vi.runAllTimers();

    expect(drafts.clear).toHaveBeenCalledTimes(1);
    expect(drafts.save).not.toHaveBeenCalled();
    expect(store.getState()).toMatchObject({
      configuration,
      draftLoadStatus: "valid",
      draftPersistenceStatus: "unavailable",
    });
  });

  test("maps a real local-storage removal failure without discarding the restored configuration", () => {
    vi.useFakeTimers();
    const configuration = { ...createDefaultConfiguration(), residents: 5 };
    const store = createConfiguratorStore(
      createDraftStorage({
        getItem: () =>
          JSON.stringify({ draftVersion: 1, currentStep: 1, configuration }),
        setItem: () => undefined,
        removeItem: () => {
          throw new Error("storage clear failed");
        },
      }),
    );

    store.getState().setCurrentStep(2);
    store.getState().clearDraftAfterPrivateProjectCreated();
    vi.runAllTimers();

    expect(store.getState()).toMatchObject({
      configuration,
      draftLoadStatus: "valid",
      draftPersistenceStatus: "unavailable",
    });
  });
});
