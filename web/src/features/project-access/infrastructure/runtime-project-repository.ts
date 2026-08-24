import { randomUUID } from "node:crypto";
import type { LeadRepository } from "@/features/leads/application/submit-lead";
import { createSupabaseLeadRepositoryFromEnvironment } from "@/features/leads/infrastructure/supabase-lead-repository";
import type { ActiveProjectAccess, PrivateProjectRecord, PrivateProjectRepository } from "../application/resolve-private-project";
import { createSupabasePrivateProjectRepositoryFromEnvironment } from "./supabase-private-project-repository";

type StoredDevelopmentProject = {
  leadId: string;
  project: PrivateProjectRecord;
  access: ActiveProjectAccess;
  consultationRequestedAt: Date | null;
};

export type DevelopmentProjectStore = {
  byIntent: Map<string, StoredDevelopmentProject>;
  byProject: Map<string, StoredDevelopmentProject>;
  byTokenHash: Map<string, StoredDevelopmentProject>;
};

type RuntimeConfiguration = {
  environment?: string;
  supabaseUrl?: string;
  serviceRoleKey?: string;
};

const LOCAL_ACCESS_SECRET = "ksb-local-project-access-token-secret-v1";
const LOCAL_SESSION_SECRET = "ksb-local-project-session-secret-v1";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function targetBudgetFrom(configuration: unknown): { min: number; max: number } | null {
  const target = asRecord(asRecord(configuration)?.targetBudget);
  return target && typeof target.min === "number" && typeof target.max === "number" && Number.isFinite(target.min) && Number.isFinite(target.max) && target.min <= target.max
    ? { min: target.min, max: target.max }
    : null;
}

export function createDevelopmentProjectStore(): DevelopmentProjectStore {
  return { byIntent: new Map(), byProject: new Map(), byTokenHash: new Map() };
}

export class DevelopmentProjectRepository implements LeadRepository, PrivateProjectRepository {
  constructor(private readonly store: DevelopmentProjectStore) {}

  async submitOnce(input: Parameters<LeadRepository["submitOnce"]>[0]) {
    const existing = this.store.byIntent.get(input.idempotencyKey);
    if (existing) return { leadId: existing.leadId, projectId: existing.project.id };

    const leadId = randomUUID();
    const projectId = randomUUID();
    const snapshot = asRecord(input.calculationSnapshot);
    const stored: StoredDevelopmentProject = {
      leadId,
      project: {
        id: projectId,
        targetBudget: targetBudgetFrom(input.configuration),
        snapshot: snapshot ? { ...snapshot, id: randomUUID(), configuration: input.configuration } : input.calculationSnapshot,
      },
      access: {
        projectId,
        tokenHash: input.tokenHash.toLowerCase(),
        expiresAt: new Date(input.expiresAt),
        revokedAt: null,
      },
      consultationRequestedAt: null,
    };
    this.store.byIntent.set(input.idempotencyKey, stored);
    this.store.byProject.set(projectId, stored);
    this.store.byTokenHash.set(stored.access.tokenHash, stored);
    return { leadId, projectId };
  }

  async findAccessByTokenHash(tokenHash: string) {
    return this.store.byTokenHash.get(tokenHash.toLowerCase())?.access ?? null;
  }

  async loadProject(projectId: string) {
    return this.store.byProject.get(projectId)?.project ?? null;
  }

  async requestConsultation(projectId: string) {
    const stored = this.store.byProject.get(projectId);
    if (!stored) throw new Error("CONSULTATION_UNAVAILABLE");
    stored.consultationRequestedAt ??= new Date();
    return stored.consultationRequestedAt;
  }
}

const globalStore = globalThis as typeof globalThis & { __ksbDevelopmentProjectStore?: DevelopmentProjectStore };
function sharedDevelopmentProjectRepository() {
  globalStore.__ksbDevelopmentProjectStore ??= createDevelopmentProjectStore();
  return new DevelopmentProjectRepository(globalStore.__ksbDevelopmentProjectStore);
}

function runtimeConfiguration(configuration: RuntimeConfiguration = {}) {
  return {
    environment: configuration.environment ?? process.env.NODE_ENV,
    supabaseUrl: configuration.supabaseUrl ?? process.env.SUPABASE_URL,
    serviceRoleKey: configuration.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function createRuntimeLeadRepository(configuration: RuntimeConfiguration = {}): LeadRepository {
  const runtime = runtimeConfiguration(configuration);
  if (runtime.supabaseUrl && runtime.serviceRoleKey) return createSupabaseLeadRepositoryFromEnvironment();
  if (runtime.environment !== "production") return sharedDevelopmentProjectRepository();
  return createSupabaseLeadRepositoryFromEnvironment();
}

export function createRuntimePrivateProjectRepository(configuration: RuntimeConfiguration = {}): PrivateProjectRepository {
  const runtime = runtimeConfiguration(configuration);
  if (runtime.supabaseUrl && runtime.serviceRoleKey) return createSupabasePrivateProjectRepositoryFromEnvironment();
  if (runtime.environment !== "production") return sharedDevelopmentProjectRepository();
  return createSupabasePrivateProjectRepositoryFromEnvironment();
}

export function runtimeProjectAccessTokenSecret(configuration: { environment?: string; configuredSecret?: string } = {}) {
  const environment = configuration.environment ?? process.env.NODE_ENV;
  const configuredSecret = configuration.configuredSecret ?? process.env.PROJECT_ACCESS_TOKEN_SECRET ?? "";
  return configuredSecret || (environment !== "production" ? LOCAL_ACCESS_SECRET : "");
}

export function runtimeProjectSessionSecret(configuration: { environment?: string; configuredSecret?: string } = {}) {
  const environment = configuration.environment ?? process.env.NODE_ENV;
  const configuredSecret = configuration.configuredSecret ?? process.env.PROJECT_SESSION_SECRET ?? "";
  return configuredSecret || (environment !== "production" ? LOCAL_SESSION_SECRET : "");
}
