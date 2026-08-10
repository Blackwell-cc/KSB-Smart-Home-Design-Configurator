import { expect, test, vi } from "vitest";
import { SupabasePublicShareRepository } from "./supabase-public-share-repository";

const content = { conceptAssetId: "contemporary-warm-luxury", styleLabel: "Contemporary Warm Luxury", floors: 2, bedrooms: 3, bathrooms: 3, parkingSpaces: 2, usableAreaM2: 164 } as const;

function queryClient(result: { data: unknown; error: unknown }) {
  const query = {
    insert: vi.fn(), select: vi.fn(), eq: vi.fn(), is: vi.fn(),
    single: vi.fn().mockResolvedValue(result), maybeSingle: vi.fn().mockResolvedValue(result),
  };
  query.insert.mockImplementation(() => query); query.select.mockImplementation(() => query);
  query.eq.mockImplementation(() => query); query.is.mockImplementation(() => query);
  return { client: { from: vi.fn(() => query) }, query };
}

test("persists only the explicit public payload and project reference", async () => {
  const { client, query } = queryClient({ data: { slug: "public-example-7f3k" }, error: null });
  const repository = new SupabasePublicShareRepository(client);

  await expect(repository.save({ projectId: "11111111-1111-4111-8111-111111111111", slug: "public-example-7f3k", publicPayload: content })).resolves.toEqual({ slug: "public-example-7f3k" });

  expect(query.insert).toHaveBeenCalledWith({ project_id: "11111111-1111-4111-8111-111111111111", slug: "public-example-7f3k", public_payload: content });
  expect(JSON.stringify(query.insert.mock.calls[0]?.[0])).not.toMatch(/name|phone|email|lineId|budget|price|notes|province|token/i);
});

test("loads only active strict public payloads and rejects extra database fields", async () => {
  const active = queryClient({ data: { slug: "public-example-7f3k", public_payload: content }, error: null });
  const repository = new SupabasePublicShareRepository(active.client);
  await expect(repository.findBySlug("public-example-7f3k")).resolves.toEqual({ ...content, slug: "public-example-7f3k" });
  expect(active.query.is).toHaveBeenCalledWith("revoked_at", null);

  const unsafe = queryClient({ data: { slug: "public-example-7f3k", public_payload: { ...content, phone: "0910000000" } }, error: null });
  await expect(new SupabasePublicShareRepository(unsafe.client).findBySlug("public-example-7f3k")).resolves.toBeNull();
});
