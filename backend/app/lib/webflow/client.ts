import { WebflowClient } from "webflow-api";

export function createWebflowClient(accessToken: string): WebflowClient {
  return new WebflowClient({ accessToken });
}

export async function getSiteInfo(accessToken: string, siteId: string) {
  const client = createWebflowClient(accessToken);
  return client.sites.get(siteId);
}

export async function getAuthorizedUser(accessToken: string) {
  const client = createWebflowClient(accessToken);
  return client.token.authorizedBy();
}
