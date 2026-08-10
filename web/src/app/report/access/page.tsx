"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseAndScrubPrivateAccessFragment } from "@/features/project-access/domain/private-access-exchange";

export default function PrivateAccessPage() {
  const router = useRouter(); const [state, setState] = useState<"loading" | "invalid">("loading");
  const exchangeRef = useRef<ReturnType<typeof parseAndScrubPrivateAccessFragment> | undefined>(undefined);
  useEffect(() => {
    const controller = new AbortController();
    if (exchangeRef.current === undefined) exchangeRef.current = parseAndScrubPrivateAccessFragment(window.location.hash, "/report/access", window.history.replaceState.bind(window.history));
    const exchange = exchangeRef.current;
    if (!exchange) { queueMicrotask(() => { if (!controller.signal.aborted) setState("invalid"); }); return () => controller.abort(); }
    void (async () => {
      try {
        const response = await fetch("/api/reports/exchange", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(exchange), signal: controller.signal });
        const payload: unknown = await response.json();
        if (!response.ok || !payload || typeof payload !== "object" || (payload as { projectId?: unknown }).projectId !== exchange.projectId) throw new Error("PROJECT_LINK_INVALID");
        router.replace(`/report/${exchange.projectId}`);
      } catch { if (!controller.signal.aborted) setState("invalid"); }
    })();
    return () => controller.abort();
  }, [router]);
  return <main><h1>{state === "loading" ? "กำลังเปิดสรุปโครงการ" : "ไม่สามารถเปิดสรุปโครงการนี้ได้"}</h1><p>{state === "loading" ? "กำลังตรวจสอบสิทธิ์การเข้าถึง" : "ลิงก์นี้ไม่พร้อมใช้งาน กรุณาติดต่อ KSB Architect เพื่อขอความช่วยเหลือ"}</p></main>;
}
