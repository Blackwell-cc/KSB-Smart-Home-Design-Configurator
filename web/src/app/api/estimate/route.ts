import { HouseConfigurationSchema } from "@/features/configurator/domain/configuration";
import { estimateProject, type PriceBookRepository } from "@/features/pricing/application/estimate-project";
import { createSupabasePriceBookRepositoryFromEnvironment } from "@/features/pricing/infrastructure/supabase-price-book-repository";

type EstimateHandlerDependencies = { priceBookRepository: PriceBookRepository };

function errorResponse(status: number, code: "INVALID_JSON" | "INVALID_CONFIGURATION" | "ESTIMATE_UNAVAILABLE") {
  return Response.json({ error: { code } }, { status });
}

export function createEstimatePostHandler({ priceBookRepository }: EstimateHandlerDependencies) {
  return async function postEstimate(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "INVALID_JSON");
    }

    const configuration = HouseConfigurationSchema.strict().safeParse(body);
    if (!configuration.success) return errorResponse(400, "INVALID_CONFIGURATION");

    try {
      const preview = await estimateProject(configuration.data, priceBookRepository);
      return Response.json({ preview });
    } catch (error) {
      if (error instanceof Error && error.message === "CONFIGURATION_NOT_READY") {
        return errorResponse(400, "INVALID_CONFIGURATION");
      }
      return errorResponse(503, "ESTIMATE_UNAVAILABLE");
    }
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    return await createEstimatePostHandler({
      priceBookRepository: createSupabasePriceBookRepositoryFromEnvironment(),
    })(request);
  } catch {
    return errorResponse(503, "ESTIMATE_UNAVAILABLE");
  }
}
