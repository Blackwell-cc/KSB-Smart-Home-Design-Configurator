import { afterEach, describe, expect, test, vi } from "vitest";
import { createDefaultConfiguration } from "../domain/configuration";
import type { DraftStorage } from "./draft-storage";
import {
  CONFIGURATOR_DRAFT_DEBOUNCE_MS,
  createConfiguratorStore,
} from "./configurator-store";

function createDraftStorageSpy(
  loadResult: ReturnType<DraftStorage["load"]> = { status: "none" },
) {
  return {
    load: vi.fn(() => loadResult),
    save: vi.fn(),
    clear: vi.fn(),
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
  });
});
