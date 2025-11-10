import MoviesGrid from "@/app/components/movies-grid.component";
import MoviesSearchBar from "@/app/components/search-bar.component";
import { MovieService } from "@/app/services/movie.service";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import React from "react";

export default async function TrendingMovies() {
  const session = await auth0.getSession();
  if (!session) {
    return redirect("/auth/login");
  }

  const [moviesResult, favoritesIdsResult] = await Promise.all([
    new MovieService().getTrending(),
    new MovieService().getUserFavoritesIds(session!.user.sub),
  ]);

  if (!moviesResult.success || !favoritesIdsResult.success) {
    return <p>An error has ocurred</p>;
  }

  return (
    <div>
      <MoviesSearchBar />

      <h2 className="text-xl mb-2">Trending movies</h2>

      <MoviesGrid
        type="trending"
        movies={moviesResult.data!.movies}
        favoritesIds={favoritesIdsResult.data!}
      />
    </div>
  );
}
