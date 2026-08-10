import { PRIVATE_ACCESS_FRAGMENT_PROJECT_KEY, PRIVATE_ACCESS_FRAGMENT_TOKEN_KEY } from "@/features/leads/domain/private-access";

const PROJECT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseAndScrubPrivateAccessFragment(fragment: string, cleanPath: string, replaceState: History["replaceState"]): { projectId: string; token: string } | null {
  const values = new URLSearchParams(fragment.startsWith("#") ? fragment.slice(1) : fragment);
  const projectId = values.get(PRIVATE_ACCESS_FRAGMENT_PROJECT_KEY); const token = values.get(PRIVATE_ACCESS_FRAGMENT_TOKEN_KEY);
  replaceState(null, "", cleanPath);
  if (!projectId || !PROJECT_ID.test(projectId) || !token || token.length < 24 || token.length > 512 || values.getAll(PRIVATE_ACCESS_FRAGMENT_PROJECT_KEY).length !== 1 || values.getAll(PRIVATE_ACCESS_FRAGMENT_TOKEN_KEY).length !== 1) return null;
  return { projectId, token };
}
