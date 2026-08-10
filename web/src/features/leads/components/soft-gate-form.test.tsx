import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { SoftGateForm } from "./soft-gate-form";

const configuration = { styleId: "contemporary-warm-luxury", residents: 3, floors: 2, bedrooms: 3, bathrooms: 3, parkingSpaces: 2, functions: { office: false, elderlyRoom: false, thaiKitchen: false, multipurposeRoom: false }, usableAreaOverrideM2: null, provinceCode: "10", siteAccess: "normal", materialLevel: "premium", specialFeatures: [] } as const;

test("reveals the value first, changes contact field, submits once, and keeps PII out of web storage", async () => {
  const user = userEvent.setup(); const onSuccess = vi.fn(); const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ leadId: "lead", projectId: "project", reportUrl: "/report/project#access=token" }), { status: 201 }));
  vi.stubGlobal("fetch", fetchMock);
  render(<SoftGateForm configuration={configuration as never} onSuccess={onSuccess} />);
  expect(screen.getByText("Detailed Project Summary")).toBeVisible();
  expect(screen.getByText("ข้อมูลของคุณจะใช้สำหรับจัดทำสรุปโครงการและติดต่อกลับเกี่ยวกับโครงการนี้เท่านั้น โดยจะจัดการข้อมูลตามนโยบายความเป็นส่วนตัวของบริษัท")).toBeVisible();
  await user.selectOptions(screen.getByLabelText("ช่องทางติดต่อที่ต้องการ"), "email");
  expect(screen.getByLabelText("อีเมล")).toBeVisible();
  await user.type(screen.getByLabelText("ชื่อ"), "ผู้ทดสอบ");
  await user.type(screen.getByLabelText("อีเมล"), "owner@example.test");
  await user.click(screen.getByLabelText(/ยินยอม/));
  await user.click(screen.getByRole("button", { name: "ส่ง Project Report ฉบับเต็มให้ฉัน" }));
  expect(screen.getByRole("button", { name: /กำลังจัดทำ/ })).toBeDisabled();
  await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("/report/project#access=token"));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(Array.from({ length: sessionStorage.length }, (_value, index) => sessionStorage.getItem(sessionStorage.key(index) ?? "")).join("\n")).not.toContain("owner@example.test");
  expect(JSON.stringify({ ...sessionStorage, ...localStorage })).not.toContain("owner@example.test");
});
