import { MovieService } from "@/app/services/movie.service";
import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // You can parse request body if needed
  const session = await auth0.getSession();

  if (!session) {
    return new NextResponse("unauthenticated", { status: 403 });
  }

  const { id: tmdbId } = await params;

  const moviesService = new MovieService();

  const result = await moviesService.getRecommendations(parseInt(tmdbId));

  return NextResponse.json({ success: result.success, data: result.data });
}
