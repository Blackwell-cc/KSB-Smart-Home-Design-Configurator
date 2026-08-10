export type ReportHandoffEvent = Readonly<{ name: "consultation_requested"; projectId: string }>;

export type ReportEventHandoff = Readonly<{ emit(event: ReportHandoffEvent): void }>;

/** A deliberately provider-free handoff point for the later delivery/tracking integration. */
export const reportEventHandoff: ReportEventHandoff = Object.freeze({ emit: () => undefined });

export function emitConsultationRequested(projectId: string, handoff: ReportEventHandoff = reportEventHandoff) {
  handoff.emit(Object.freeze({ name: "consultation_requested", projectId }));
}
