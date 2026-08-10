import { expect, test } from "vitest";
import { parseAndScrubPrivateAccessFragment } from "./private-access-exchange";

test("reads the private fragment only in memory and immediately removes it from browser history", () => {
  const replace = vi.fn();
  const exchange = parseAndScrubPrivateAccessFragment("#project=11111111-1111-4111-8111-111111111111&token=private-token-12345678901234567890", "/report/access", replace);

  expect(exchange).toEqual({ projectId: "11111111-1111-4111-8111-111111111111", token: "private-token-12345678901234567890" });
  expect(replace).toHaveBeenCalledWith(null, "", "/report/access");
});

test("scrubs malformed fragments without returning a token", () => {
  const replace = vi.fn();
  expect(parseAndScrubPrivateAccessFragment("#token=x", "/report/access", replace)).toBeNull();
  expect(replace).toHaveBeenCalledWith(null, "", "/report/access");
});
