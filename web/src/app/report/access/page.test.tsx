import { StrictMode } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import PrivateAccessPage from "./page";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

test("exchanges a scrubbed fragment without storing or displaying its private token", async () => {
  window.history.replaceState(null, "", "/report/access#project=11111111-1111-4111-8111-111111111111&token=private-token-12345678901234567890");
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ projectId: "11111111-1111-4111-8111-111111111111" }), { status: 200 })); vi.stubGlobal("fetch", fetchMock);
  render(<PrivateAccessPage />);

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/report/11111111-1111-4111-8111-111111111111"));
  expect(fetchMock).toHaveBeenCalledWith("/api/reports/exchange", expect.objectContaining({ method: "POST", credentials: "same-origin" }));
  expect(window.location.hash).toBe("");
  expect(screen.queryByText(/private-token/i)).not.toBeInTheDocument();
});

test("keeps the parsed secret in memory across the development Strict Mode effect replay", async () => {
  window.history.replaceState(null, "", "/report/access#project=11111111-1111-4111-8111-111111111111&token=private-token-12345678901234567890");
  vi.stubGlobal("fetch", vi.fn((_url: string, options?: RequestInit) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  })));

  render(<StrictMode><PrivateAccessPage /></StrictMode>);
  await act(async () => { await Promise.resolve(); });

  expect(screen.getByRole("heading", { name: "กำลังเปิดสรุปโครงการ" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "ไม่สามารถเปิดสรุปโครงการนี้ได้" })).not.toBeInTheDocument();
  expect(window.location.hash).toBe("");
});
