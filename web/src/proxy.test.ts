import { NextRequest } from "next/server";
import { expect, test, vi } from "vitest";
import { config, createAdminSessionProxy } from "./proxy";

test("refreshes Supabase auth cookies only through the admin route proxy", async () => {
  const getUser = vi.fn();
  const handler = createAdminSessionProxy((cookieMethods) => ({ auth: { getUser: getUser.mockImplementation(async () => {
    cookieMethods.setAll([{ name: "sb-session", value: "refreshed", options: { httpOnly: true, path: "/" } }]);
    return { data: { user: null }, error: null };
  }) } }));

  const response = await handler(new NextRequest("https://ksb.test/admin/pricing", { headers: { cookie: "sb-session=old" } }));

  expect(getUser).toHaveBeenCalledOnce();
  expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
  expect(config.matcher).toEqual(["/admin/:path*", "/api/admin/:path*"]);
});
