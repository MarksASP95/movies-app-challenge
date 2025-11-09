import MoviesGrid from "@/app/components/movies-grid.component";
import MoviesSearchBar from "@/app/components/search-bar.component";
import { MovieService } from "@/app/services/movie.service";
import { auth0 } from "@/lib/auth0";

async function FavoritesView() {
  const session = await auth0.getSession();
  const favoritesResult = await new MovieService().getUserFavorites(
    session!.user.sub
  );

  if (!favoritesResult.success) {
    return <p>Could not get favorites</p>;
  }

  return (
    <div>
      <MoviesSearchBar />

      <h2 className="text-xl mb-2">Your favorite movies</h2>

      <MoviesGrid type="favorites" movies={favoritesResult.data!} />
    </div>
  );
}

export default FavoritesView;
