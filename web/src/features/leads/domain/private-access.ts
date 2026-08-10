export const PRIVATE_ACCESS_EXCHANGE_PATH = "/report/access";
export const PRIVATE_ACCESS_FRAGMENT_PROJECT_KEY = "project";
export const PRIVATE_ACCESS_FRAGMENT_TOKEN_KEY = "token";

export type PrivateAccessExchange = { projectId: string; token: string };

export function buildPrivateAccessExchangeUrl({ projectId, token }: PrivateAccessExchange) {
  return `${PRIVATE_ACCESS_EXCHANGE_PATH}#${PRIVATE_ACCESS_FRAGMENT_PROJECT_KEY}=${encodeURIComponent(projectId)}&${PRIVATE_ACCESS_FRAGMENT_TOKEN_KEY}=${encodeURIComponent(token)}`;
}
