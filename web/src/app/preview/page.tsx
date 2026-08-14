"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { FreePreview } from "@/features/preview/components/free-preview";
import { SoftGateForm } from "@/features/leads/components/soft-gate-form";
import { createDraftStorage } from "@/features/configurator/state/draft-storage";
import {
  projectDesignBriefConfiguration,
  type DesignBriefConfiguration,
} from "@/features/configurator/domain/configuration";
import type { FreePreviewPayload } from "@/features/preview/application/build-free-preview";
import { projectEstimateRequest } from "@/features/pricing/application/estimate-request";

type PreviewState =
  | { status: "loading" }
  | { status: "ready"; preview: FreePreviewPayload; configuration: DesignBriefConfiguration }
  | { status: "no-draft" | "invalid-draft" | "unavailable" };
const FreePreviewPayloadSchema = z.object({
  conceptAssetId: z.string(), styleLabel: z.string(), floors: z.number().int(), bedrooms: z.number().int(), bathrooms: z.number().int(), parkingSpaces: z.number().int(), usableAreaM2: z.number(), constructionFloorAreaM2: z.number(), materialLevel: z.enum(["select", "premium", "signature"]), constructionRange: z.object({ low: z.number(), high: z.number() }).strict(), designFeeRange: z.object({ low: z.number(), high: z.number() }).strict(), budgetRange: z.object({ low: z.number(), high: z.number() }).strict(), confidence: z.literal("C"), estimateMode: z.enum(["published", "development-demo"]), disclaimer: z.string(),
}).strict();

export default function PreviewPage() {
  const router = useRouter(); const [state, setState] = useState<PreviewState>({ status: "loading" }); const [showSoftGate, setShowSoftGate] = useState(false);
  useEffect(() => {
    let cancelled = false; const controller = new AbortController();
    const loadPreview = async () => {
      let stored; try { stored = createDraftStorage(window.localStorage).load(); } catch { if (!cancelled) setState({ status: "unavailable" }); return; }
      if (stored.status === "none") { if (!cancelled) setState({ status: "no-draft" }); return; }
      if (stored.status === "unavailable") { if (!cancelled) setState({ status: "unavailable" }); return; }
      if (stored.status !== "valid") { if (!cancelled) setState({ status: "invalid-draft" }); return; }
      try {
        const configuration = projectDesignBriefConfiguration(stored.draft.configuration);
        const estimateRequest = projectEstimateRequest(stored.draft.configuration);
        const response = await fetch("/api/estimate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(estimateRequest), signal: controller.signal });
        const payload = await response.json(); const parsed = FreePreviewPayloadSchema.safeParse(payload?.preview);
        if (!response.ok || !parsed.success) throw new Error("ESTIMATE_UNAVAILABLE");
        if (!cancelled) setState({ status: "ready", preview: parsed.data, configuration });
      } catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; if (!cancelled) setState({ status: "unavailable" }); }
    };
    void loadPreview(); return () => { cancelled = true; controller.abort(); };
  }, []);
  const preview = state.status === "ready" ? state.preview : undefined; const configuration = state.status === "ready" ? state.configuration : undefined;
  return <>
    <FreePreview status={state.status} preview={preview} onBack={() => router.push("/configurator")} onFullReport={() => setShowSoftGate(true)} onShare={() => undefined} />
    {showSoftGate && configuration ? <SoftGateForm configuration={configuration} onSuccess={(reportUrl) => { createDraftStorage(window.localStorage).clear(); router.push(reportUrl); }} /> : null}
  </>;
}
