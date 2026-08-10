import { AnalyticsEventSchema, type AnalyticsEvent } from "./event-schema";

export type AnalyticsProvider = { send(event: AnalyticsEvent): Promise<void> };
export type AnalyticsLogger = { warn(entry: { code: "ANALYTICS_PROVIDER_FAILED"; eventName: AnalyticsEvent["name"] }): void };
const logger: AnalyticsLogger = { warn: (entry) => console.warn(entry) };

export async function trackEvent(rawEvent: unknown, provider: AnalyticsProvider, log: AnalyticsLogger = logger): Promise<boolean> {
  const event = AnalyticsEventSchema.parse(rawEvent);
  try { await provider.send(event); return true; }
  catch { log.warn({ code: "ANALYTICS_PROVIDER_FAILED", eventName: event.name }); return false; }
}
