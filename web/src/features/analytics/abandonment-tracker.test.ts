import { expect, test, vi } from "vitest";
import { AbandonmentTracker } from "./abandonment-tracker";

test("starts, submits, and explicitly abandons lead-form sessions through repository semantics", async () => {
  const repository = { start: vi.fn(), markSubmitted: vi.fn(), markAbandoned: vi.fn(), expireUnsubmittedBefore: vi.fn() };
  const tracker = new AbandonmentTracker(repository, () => new Date("2026-08-07T12:00:00.000Z"));
  await tracker.start("session-1"); await tracker.markSubmitted("session-1"); await tracker.markExplicitlyAbandoned("session-2");
  expect(repository.start).toHaveBeenCalledWith("session-1", new Date("2026-08-07T12:00:00.000Z"));
  expect(repository.markSubmitted).toHaveBeenCalledWith("session-1", new Date("2026-08-07T12:00:00.000Z"));
  expect(repository.markAbandoned).toHaveBeenCalledWith("session-2", new Date("2026-08-07T12:00:00.000Z"), "explicit-leave");
});

test("expires unsubmitted sessions without depending on beforeunload", async () => {
  const repository = { start: vi.fn(), markSubmitted: vi.fn(), markAbandoned: vi.fn(), expireUnsubmittedBefore: vi.fn().mockResolvedValue(4) };
  const tracker = new AbandonmentTracker(repository, () => new Date("2026-08-07T12:00:00.000Z"));
  await expect(tracker.expireInactive(30 * 60 * 1000)).resolves.toBe(4);
  expect(repository.expireUnsubmittedBefore).toHaveBeenCalledWith(new Date("2026-08-07T11:30:00.000Z"), new Date("2026-08-07T12:00:00.000Z"));
});
