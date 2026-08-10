import { expect, test } from "vitest";
import { PRIVATE_ACCESS_EXCHANGE_PATH, PRIVATE_ACCESS_FRAGMENT_PROJECT_KEY, PRIVATE_ACCESS_FRAGMENT_TOKEN_KEY, buildPrivateAccessExchangeUrl } from "./private-access";

test("builds the Task 9 private exchange handoff with all secrets in the URL fragment", () => {
  const url = buildPrivateAccessExchangeUrl({ projectId: "project / id", token: "token+/=" });
  expect(PRIVATE_ACCESS_EXCHANGE_PATH).toBe("/report/access");
  expect(url).toBe("/report/access#project=project%20%2F%20id&token=token%2B%2F%3D");
  expect(url).not.toContain("?");
  expect([PRIVATE_ACCESS_FRAGMENT_PROJECT_KEY, PRIVATE_ACCESS_FRAGMENT_TOKEN_KEY]).toEqual(["project", "token"]);
});
