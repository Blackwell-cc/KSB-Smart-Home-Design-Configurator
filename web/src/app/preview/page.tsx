"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { FreePreview } from "@/features/preview/components/free-preview";
import { createDraftStorage } from "@/features/configurator/state/draft-storage";
import type { FreePreviewPayload } from "@/features/preview/application/build-free-preview";
import { projectEstimateRequest } from "@/features/pricing/application/estimate-request";

type PreviewState =
  | { status: "loading" }
  | { status: "ready"; preview: FreePreviewPayload }
  | { status: "no-draft" | "invalid-draft" | "unavailable" };

const FreePreviewPayloadSchema = z.object({
  conceptAssetId: z.string(),
  styleLabel: z.string(),
  floors: z.number().int(),
  bedrooms: z.number().int(),
  bathrooms: z.number().int(),
  parkingSpaces: z.number().int(),
  usableAreaM2: z.number(),
  constructionFloorAreaM2: z.number(),
  materialLevel: z.enum(["select", "premium", "signature"]),
  budgetRange: z.object({ low: z.number(), high: z.number() }).strict(),
  confidence: z.literal("C"),
  disclaimer: z.string(),
}).strict();

export default function PreviewPage() {
  const router = useRouter();
  const [state, setState] = useState<PreviewState>({ status: "loading" });
  const [handoff, setHandoff] = useState("");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const loadPreview = async () => {
      let stored;
      try {
        stored = createDraftStorage(window.localStorage).load();
      } catch {
        if (!cancelled) setState({ status: "unavailable" });
        return;
      }

      if (stored.status === "none") {
        if (!cancelled) setState({ status: "no-draft" });
        return;
      }
      if (stored.status === "unavailable") {
        if (!cancelled) setState({ status: "unavailable" });
        return;
      }
      if (stored.status !== "valid") {
        if (!cancelled) setState({ status: "invalid-draft" });
        return;
      }

      try {
        const response = await fetch("/api/estimate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(projectEstimateRequest(stored.draft.configuration)),
          signal: controller.signal,
        });
        const payload = await response.json();
        const parsed = FreePreviewPayloadSchema.safeParse(payload?.preview);
        if (!response.ok || !parsed.success) throw new Error("ESTIMATE_UNAVAILABLE");
        if (!cancelled) setState({ status: "ready", preview: parsed.data });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!cancelled) setState({ status: "unavailable" });
      }
    };
    void loadPreview();
    return () => { cancelled = true; controller.abort(); };
  }, []);

  const preview = state.status === "ready" ? state.preview : undefined;
  return (
    <>
      <FreePreview
        status={state.status}
        preview={preview}
        onBack={() => router.push("/configurator")}
        onFullReport={() => setHandoff("เตรียมขั้นตอนรับสรุปโครงการฉบับเต็ม")}
        onShare={() => setHandoff("การแชร์ภาพ Preview จะพร้อมใช้งานในขั้นตอนถัดไป")}
      />
      {handoff ? <p aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{handoff}</p> : null}
    </>
  );
}
