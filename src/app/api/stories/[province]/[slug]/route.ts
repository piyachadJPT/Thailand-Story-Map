import { getStoryByProvinceAndSlug } from "@/api/stories/service";
import { jsonOk, handleRouteError } from "@/api/common/http";

type Params = { params: Promise<{ province: string; slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { province, slug } = await params;
    const story = await getStoryByProvinceAndSlug(province, slug);
    return jsonOk(story);
  } catch (error) {
    return handleRouteError(error);
  }
}
