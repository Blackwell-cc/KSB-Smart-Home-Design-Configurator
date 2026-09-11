"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { FreePreview, type PreviewShareChannel } from "@/features/preview/components/free-preview";
import { FullReportRequestModal } from "@/features/leads/components/full-report-request-modal";
import { createDraftStorage } from "@/features/configurator/state/draft-storage";
import {
  projectDesignBriefConfiguration,
  type DesignBriefConfiguration,
} from "@/features/configurator/domain/configuration";
import type { FreePreviewPayload } from "@/features/preview/application/build-free-preview";
import { projectEstimateRequest } from "@/features/pricing/application/estimate-request";
import { waitForMinimumPreviewLoading } from "./loading-delay";

type PreviewState =
  | { status: "loading" }
  | { status: "ready"; preview: FreePreviewPayload; configuration: DesignBriefConfiguration }
  | { status: "no-draft" | "invalid-draft" | "unavailable" };
const FreePreviewPayloadSchema = z.object({
  conceptAssetId: z.string(), styleLabel: z.string(), floors: z.number().int(), bedrooms: z.number().int(), bathrooms: z.number().int(), parkingSpaces: z.number().int(), usableAreaM2: z.number(), constructionFloorAreaM2: z.number(), materialLevel: z.enum(["select", "premium", "signature"]), constructionRange: z.object({ low: z.number(), high: z.number() }).strict(), designFeeRange: z.object({ low: z.number(), high: z.number() }).strict(), budgetRange: z.object({ low: z.number(), high: z.number() }).strict(), confidence: z.literal("C"), estimateMode: z.enum(["published", "development-demo"]), disclaimer: z.string(),
}).strict();

export default function PreviewPage() {
  const router = useRouter(); const [state, setState] = useState<PreviewState>({ status: "loading" }); const [showSoftGate, setShowSoftGate] = useState(false); const [shareStatus, setShareStatus] = useState({ id: 0, message: "" });
  const shareFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareOperationRef = useRef(0);
  useEffect(() => {
    let cancelled = false; const controller = new AbortController();
    const loadingStartedAt = performance.now();
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
        await waitForMinimumPreviewLoading(loadingStartedAt, controller.signal);
        if (!cancelled) setState({ status: "ready", preview: parsed.data, configuration });
      } catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; if (!cancelled) setState({ status: "unavailable" }); }
    };
    void loadPreview(); return () => { cancelled = true; controller.abort(); };
  }, []);
  useEffect(() => () => {
    if (shareFeedbackTimerRef.current) clearTimeout(shareFeedbackTimerRef.current);
  }, []);
  const preview = state.status === "ready" ? state.preview : undefined; const configuration = state.status === "ready" ? state.configuration : undefined;
  const startOver = () => {
    createDraftStorage(window.localStorage).clear();
    router.push("/");
  };
  const showShareStatus = (message: string) => {
    if (shareFeedbackTimerRef.current) clearTimeout(shareFeedbackTimerRef.current);
    setShareStatus((current) => ({ id: current.id + 1, message }));
    shareFeedbackTimerRef.current = setTimeout(() => setShareStatus((current) => ({ ...current, message: "" })), 5_200);
  };
  const shareResult = async (channel: PreviewShareChannel) => {
    const operationId = ++shareOperationRef.current;
    const shareUrl = window.location.href;
    const encodedUrl = encodeURIComponent(shareUrl);
    const shareText = "ลองออกแบบบ้านในฝันของคุณกับ KSB Architect";
    if (channel === "line") { window.open(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`, "_blank", "noopener,noreferrer"); return; }
    if (channel === "instagram") {
      let copyPromise: Promise<void> | undefined;
      try { copyPromise = navigator.clipboard.writeText(`${shareText} ${shareUrl}`); } catch { copyPromise = undefined; }
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      try {
        if (!copyPromise) throw new Error("CLIPBOARD_UNAVAILABLE");
        await copyPromise;
        if (operationId === shareOperationRef.current) showShareStatus("คัดลอกลิงก์แล้ว พร้อมนำไปวางใน Instagram");
      } catch {
        if (operationId === shareOperationRef.current) showShareStatus("เปิด Instagram แล้ว แต่ยังคัดลอกลิงก์ไม่ได้");
      }
      return;
    }
    if (channel === "facebook") { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "noopener,noreferrer"); return; }
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      if (operationId === shareOperationRef.current) showShareStatus("คัดลอกลิงก์แล้ว");
    } catch {
      if (operationId === shareOperationRef.current) showShareStatus("ยังคัดลอกลิงก์ไม่ได้ กรุณาคัดลอกจากแถบที่อยู่");
    }
  };
  return <>
    <FreePreview status={state.status} preview={preview} configuration={configuration} shareStatus={shareStatus.message} shareStatusKey={shareStatus.id} onBack={() => router.push("/configurator")} onFullReport={() => setShowSoftGate(true)} onShare={(channel) => { void shareResult(channel); }} onStartOver={startOver} />
    {configuration && preview ? <FullReportRequestModal configuration={configuration} preview={preview} open={showSoftGate} onClose={() => setShowSoftGate(false)} onSuccess={(reportUrl) => { router.push(reportUrl); }} /> : null}
  </>;
}
