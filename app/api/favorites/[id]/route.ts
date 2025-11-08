import { UpdateFavoriteInput } from "@/app/models/movie.model";
import { MovieService } from "@/app/services/movie.service";
import { auth0 } from "@/lib/auth0";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export async function GET(
  _: NextApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // You can parse request body if needed
  const session = await auth0.getSession();

  if (!session) {
    return new NextResponse("unauthenticated", { status: 403 });
  }

  const { id: tmdbId } = await params;

  const moviesService = new MovieService();

  const result = await moviesService.getFavorite(
    session.user.sub,
    parseInt(tmdbId)
  );

  return NextResponse.json({ success: result.success, data: result.data });
}

export async function DELETE(
  _: NextApiRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // You can parse request body if needed
  const session = await auth0.getSession();

  if (!session) {
    return new NextResponse("unauthenticated", { status: 403 });
  }

  const { id: tmdbId } = await params;

  const moviesService = new MovieService();

  const result = await moviesService.toggleFavorite(
    session.user.sub,
    parseInt(tmdbId),
    false
  );

  return NextResponse.json({ success: result.success, data: result.data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // You can parse request body if needed
  const session = await auth0.getSession();

  if (!session) {
    return new NextResponse("unauthenticated", { status: 403 });
  }
  const { id: tmdbId } = await params;
  const { rating, take } = (await request.json()) as UpdateFavoriteInput;

  const moviesService = new MovieService();

  const result = await moviesService.updateFavorite(
    session.user.sub,
    parseInt(tmdbId),
    {
      userRating: rating,
      userTake: take,
    }
  );

  return NextResponse.json({ success: result.success, data: result.data });
}
