export type AbandonmentRepository = {
  start(sessionId: string, startedAt: Date): Promise<void>;
  markSubmitted(sessionId: string, submittedAt: Date): Promise<void>;
  markAbandoned(sessionId: string, abandonedAt: Date, reason: "explicit-leave"): Promise<void>;
  expireUnsubmittedBefore(cutoff: Date, expiredAt: Date): Promise<number>;
};

function session(value: string) { if (!/^[A-Za-z0-9_-]{1,128}$/.test(value)) throw new Error("INVALID_ANALYTICS_SESSION"); return value; }

export class AbandonmentTracker {
  constructor(private readonly repository: AbandonmentRepository, private readonly now: () => Date = () => new Date()) {}
  start(sessionId: string) { return this.repository.start(session(sessionId), this.now()); }
  markSubmitted(sessionId: string) { return this.repository.markSubmitted(session(sessionId), this.now()); }
  markExplicitlyAbandoned(sessionId: string) { return this.repository.markAbandoned(session(sessionId), this.now(), "explicit-leave"); }
  expireInactive(inactivityMs: number) {
    if (!Number.isSafeInteger(inactivityMs) || inactivityMs <= 0) throw new Error("INVALID_ABANDONMENT_WINDOW");
    const now = this.now(); return this.repository.expireUnsubmittedBefore(new Date(now.getTime() - inactivityMs), now);
  }
}
