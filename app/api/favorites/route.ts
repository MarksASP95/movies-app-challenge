import { CreateFavoriteInput, Movie } from "@/app/models/movie.model";
import { MovieService } from "@/app/services/movie.service";
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth0.getSession();

  if (!session) {
    return new NextResponse("unauthenticated", { status: 403 });
  }
  const { tmdbId } = (await request.json()) as CreateFavoriteInput;

  let movie: Movie | null = null;
  const moviesService = new MovieService();
  const savedMovieResult = await moviesService.getByIdSaved(tmdbId);

  movie = savedMovieResult.data;

  if (!movie) {
    const result = await moviesService.getByIdAPI(tmdbId);
    movie = result.data;
  }

  if (!movie) {
    return new NextResponse(JSON.stringify({ success: false }), {
      status: 404,
    });
  }

  const result = await moviesService.saveFavorite(session.user.sub, movie);

  return NextResponse.json({ success: result.success, data: result.data });
}
